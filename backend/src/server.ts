import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';
import meetingRoutes from './routes/meetingRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import relationshipRoutes from './routes/relationshipRoutes.js';
import * as meetingService from './services/meetingService.js';
import * as userService from './services/userService.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// 현재 활성 회의 추적 (meetingId -> dbMeetingId)
const activeMeetings = new Map<string, string>();

// 회의별 마지막 전사 텍스트 추적 (중복 방지)
const lastTranscripts = new Map<string, string>();

// 텍스트 중복 체크 함수: 새 전사가 이전과 다른지 확인
function getNewContent(meetingId: string, newText: string): string | null {
  const lastText = lastTranscripts.get(meetingId) || '';
  const trimmedNew = newText.trim();
  const trimmedLast = lastText.trim();

  // 완전 동일하면 무시
  if (trimmedNew === trimmedLast) return null;

  // 새 텍스트가 이전 텍스트에 완전히 포함되면 무시
  if (trimmedLast.includes(trimmedNew)) return null;

  // 새 텍스트가 이전 텍스트를 포함하면 (누적 전사), 새로운 부분만 추출
  if (trimmedNew.includes(trimmedLast) && trimmedLast.length > 20) {
    const newPart = trimmedNew.substring(trimmedLast.length).trim();
    if (newPart.length < 5) return null; // 새 부분이 너무 짧으면 무시
    return newPart;
  }

  return trimmedNew;
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'onno-backend' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/relationships', relationshipRoutes);

// WebSocket 연결 처리
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_meeting', async (data) => {
    const { meetingId, userId, title, relationshipId, meetingType } = data;
    socket.join(`meeting-${meetingId}`);
    console.log(`User ${userId} joined meeting ${meetingId}` + (relationshipId ? ` with relationship ${relationshipId}` : ''));

    // 데이터베이스에 회의 생성 (아직 없으면)
    if (!activeMeetings.has(meetingId)) {
      try {
        const dbMeeting = await meetingService.createMeeting({
          title: title || `Meeting ${meetingId}`,
          userId,
          relationshipObjectId: relationshipId,
          meetingType: meetingType || 'GENERAL',
        });
        activeMeetings.set(meetingId, dbMeeting.id);
        console.log(`Created meeting in DB: ${dbMeeting.id}` + (relationshipId ? ` linked to relationship ${relationshipId}` : ''));
      } catch (error) {
        console.error('Failed to create meeting in DB:', error);
      }
    }

    // 참가자에게 알림
    socket.to(`meeting-${meetingId}`).emit('participant_joined', {
      userId,
      timestamp: new Date().toISOString()
    });

    // DB 회의 ID 전송
    socket.emit('meeting_joined', {
      meetingId,
      dbMeetingId: activeMeetings.get(meetingId),
      relationshipId,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('audio_chunk', async (data) => {
    const { meetingId, audioData, userId } = data;

    try {
      // AI Service로 오디오 전송
      const formData = new FormData();
      formData.append('audio', Buffer.from(audioData), {
        filename: 'chunk.webm',
        contentType: 'audio/webm'
      });

      console.log('Sending audio to AI Service...');

      const sttResponse = await axios.post(
        `${AI_SERVICE_URL}/api/stt/transcribe`,
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 30000
        }
      );

      const transcript = sttResponse.data;
      console.log('Transcription received:', transcript.text?.substring(0, 50) + '...');

      // 빈 전사 결과는 무시
      if (!transcript.text || transcript.text.trim().length === 0) {
        console.log('Empty transcript, skipping...');
        return;
      }

      // 중복 체크: 새로운 내용만 추출
      const newContent = getNewContent(meetingId, transcript.text);
      if (!newContent) {
        console.log('Duplicate transcript, skipping...');
        return;
      }

      // 마지막 전사 텍스트 업데이트
      lastTranscripts.set(meetingId, transcript.text);

      // 전사 결과를 클라이언트로 전송 (새 부분만)
      const transcriptId = Date.now().toString();
      io.to(`meeting-${meetingId}`).emit('transcription', {
        id: transcriptId,
        text: newContent,
        formattedText: transcript.formatted_text,
        segments: transcript.segments || [],
        timestamp: new Date().toISOString(),
        latency: transcript.latency,
        provider: transcript.provider
      });

      // 데이터베이스에 전사 저장
      const dbMeetingId = activeMeetings.get(meetingId);
      if (dbMeetingId) {
        try {
          // 각 세그먼트별로 저장
          const segments = transcript.segments || [];
          if (segments.length > 0) {
            for (const seg of segments) {
              await meetingService.addTranscript(dbMeetingId, {
                text: seg.text,
                speaker: seg.speaker,
                speakerRole: seg.speakerRole,
                startTime: seg.startTime,
                provider: transcript.provider,
                latency: transcript.latency,
              });
            }
          } else {
            // 세그먼트가 없으면 전체 텍스트로 저장
            await meetingService.addTranscript(dbMeetingId, {
              text: transcript.text,
              formattedText: transcript.formatted_text,
              provider: transcript.provider,
              latency: transcript.latency,
            });
          }
          console.log('Transcript saved to DB');
        } catch (error) {
          console.error('Failed to save transcript to DB:', error);
        }
      }

      // 전사가 일정 길이 이상이면 질문 생성
      if (transcript.text.length > 50) {
        console.log('Generating questions...');

        const questionResponse = await axios.post(
          `${AI_SERVICE_URL}/api/questions/generate`,
          { transcript: transcript.text },
          { timeout: 15000 }
        );

        let questions = questionResponse.data.questions;
        console.log(`Generated ${questions.length} questions`);

        // 개인화 적용 (userId가 있는 경우)
        if (userId) {
          try {
            const personalizedQuestions = await userService.personalizeQuestions(userId, questions);
            questions = personalizedQuestions;
            console.log('Questions personalized for user:', userId);
          } catch (error) {
            console.error('Failed to personalize questions:', error);
          }
        }

        // 질문들을 클라이언트로 전송 및 DB 저장
        for (const question of questions) {
          const questionId = Date.now().toString() + Math.random();

          io.to(`meeting-${meetingId}`).emit('question_suggested', {
            id: questionId,
            ...question,
            timestamp: new Date().toISOString()
          });

          // DB에 질문 저장
          if (dbMeetingId) {
            try {
              await meetingService.addQuestion(dbMeetingId, {
                text: question.text,
                category: question.category,
                priority: question.priority || 0,
                context: transcript.text.substring(0, 200), // 맥락 저장
              });
            } catch (error) {
              console.error('Failed to save question to DB:', error);
            }
          }
        }
      }

    } catch (error: any) {
      console.error('Audio processing error:', error.message);
      socket.emit('error', {
        type: 'audio_processing',
        message: 'Failed to process audio: ' + error.message
      });
    }
  });

  socket.on('leave_meeting', async (data) => {
    const { meetingId, userId, endMeeting: shouldEnd } = data;
    socket.leave(`meeting-${meetingId}`);
    console.log(`User ${userId} left meeting ${meetingId}`);

    // 회의 종료 요청 시 DB에서 회의 종료 처리
    if (shouldEnd) {
      const dbMeetingId = activeMeetings.get(meetingId);
      if (dbMeetingId) {
        try {
          await meetingService.endMeeting(dbMeetingId);
          activeMeetings.delete(meetingId);
          lastTranscripts.delete(meetingId); // 전사 추적 정리
          console.log(`Meeting ${dbMeetingId} ended in DB`);
        } catch (error) {
          console.error('Failed to end meeting in DB:', error);
        }
      }
    }

    socket.to(`meeting-${meetingId}`).emit('participant_left', {
      userId,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`✅ AI Service URL: ${AI_SERVICE_URL}`);
});
