import { useEffect } from 'react';
import { AudioRecorder } from './AudioRecorder';
import { TranscriptPanel } from './TranscriptPanel';
import { QuestionCard } from './QuestionCard';
import { useMeetingStore } from '../stores/meetingStore';
import websocketService from '../services/websocket';

export function MeetingRoom() {
  const { questions, isRecording, reset } = useMeetingStore();

  const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
  const MEETING_ID = 'prototype-meeting-1';
  const USER_ID = 'user-1';

  useEffect(() => {
    // WebSocket 연결
    websocketService.connect(WS_URL);
    websocketService.joinMeeting(MEETING_ID, USER_ID);

    return () => {
      websocketService.leaveMeeting(USER_ID);
      websocketService.disconnect();
      reset();
    };
  }, []);

  const handleAudioChunk = (blob: Blob) => {
    websocketService.sendAudioChunk(blob);
  };

  return (
    <div className="meeting-room">
      <header className="meeting-header">
        <h1>🎯 Onno 프로토타입</h1>
        <div className="meeting-status">
          {isRecording ? (
            <span className="status-recording">🔴 녹음 중</span>
          ) : (
            <span className="status-idle">⚪ 대기 중</span>
          )}
        </div>
      </header>

      <div className="meeting-controls">
        <AudioRecorder onAudioChunk={handleAudioChunk} />
      </div>

      <div className="meeting-content">
        <div className="left-panel">
          <TranscriptPanel />
        </div>

        <div className="right-panel">
          <div className="questions-section">
            <h3>💡 AI 질문 제안</h3>
            <div className="questions-list">
              {questions.length === 0 && (
                <p className="empty-state">
                  대화가 진행되면 AI가 질문을 제안합니다.
                </p>
              )}
              {questions
                .filter((q) => q.action !== 'dismissed')
                .map((q) => (
                  <QuestionCard key={q.id} question={q} />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
