import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'onno-backend' });
});

// WebSocket 연결 처리
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_meeting', (data) => {
    const { meetingId, userId } = data;
    socket.join(`meeting-${meetingId}`);
    console.log(`User ${userId} joined meeting ${meetingId}`);

    // 참가자에게 알림
    socket.to(`meeting-${meetingId}`).emit('participant_joined', {
      userId,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('audio_chunk', async (data) => {
    const { meetingId, audioData } = data;

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
      console.log('Transcription received:', transcript.text.substring(0, 50) + '...');

      // 전사 결과를 클라이언트로 전송
      io.to(`meeting-${meetingId}`).emit('transcription', {
        id: Date.now().toString(),
        text: transcript.text,
        timestamp: new Date().toISOString(),
        latency: transcript.latency
      });

      // 전사가 일정 길이 이상이면 질문 생성 (Mock 모드: 20자, 실제: 100자)
      if (transcript.text.length > 20) {
        console.log('Generating questions...');

        const questionResponse = await axios.post(
          `${AI_SERVICE_URL}/api/questions/generate`,
          { transcript: transcript.text },
          { timeout: 15000 }
        );

        const questions = questionResponse.data.questions;
        console.log(`Generated ${questions.length} questions`);

        // 질문들을 클라이언트로 전송
        questions.forEach((question: any) => {
          io.to(`meeting-${meetingId}`).emit('question_suggested', {
            id: Date.now().toString() + Math.random(),
            ...question,
            timestamp: new Date().toISOString()
          });
        });
      }

    } catch (error: any) {
      console.error('Audio processing error:', error.message);
      socket.emit('error', {
        type: 'audio_processing',
        message: 'Failed to process audio: ' + error.message
      });
    }
  });

  socket.on('leave_meeting', (data) => {
    const { meetingId, userId } = data;
    socket.leave(`meeting-${meetingId}`);
    console.log(`User ${userId} left meeting ${meetingId}`);

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
