import { useEffect, useState } from 'react';
import { AudioRecorder } from './AudioRecorder';
import { TranscriptPanel } from './TranscriptPanel';
import { QuestionCard } from './QuestionCard';
import { useMeetingStore } from '../stores/meetingStore';
import { toast } from '../stores/toastStore';
import websocketService from '../services/websocket';

interface MeetingRoomProps {
  onBack?: () => void;
}

export function MeetingRoom({ onBack }: MeetingRoomProps) {
  const { questions, isRecording, reset } = useMeetingStore();
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  // 새 회의 ID는 컴포넌트 마운트 시 한 번만 생성
  const [meetingId] = useState(() => 'meeting-' + Date.now());

  const WS_URL = import.meta.env.VITE_WS_URL || 'https://onno-backend.onrender.com';
  const USER_ID = 'user-1';

  useEffect(() => {
    setConnectionStatus('connecting');

    try {
      websocketService.connect(WS_URL);
      websocketService.joinMeeting(meetingId, USER_ID);
      setConnectionStatus('connected');
      toast.success('회의에 연결되었습니다');
    } catch (error) {
      setConnectionStatus('error');
      toast.error('연결에 실패했습니다');
    }

    return () => {
      websocketService.leaveMeeting(USER_ID, true);
      websocketService.disconnect();
      reset();
    };
  }, []);

  const handleAudioChunk = (blob: Blob) => {
    websocketService.sendAudioChunk(blob);
  };

  const handleEndMeeting = () => {
    websocketService.leaveMeeting(USER_ID, true);
    toast.info('회의가 종료되었습니다');
    if (onBack) {
      onBack();
    }
  };

  return (
    <div className="meeting-room">
      <header className="meeting-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '8px'
              }}
              title="회의 목록으로"
            >
              ←
            </button>
          )}
          <h1>Onno</h1>
        </div>
        <div className="meeting-status">
          {connectionStatus === 'connecting' && (
            <span style={{ color: '#F59E0B' }}>연결 중...</span>
          )}
          {connectionStatus === 'connected' && isRecording && (
            <span className="status-recording">녹음 중</span>
          )}
          {connectionStatus === 'connected' && !isRecording && (
            <span className="status-idle">대기 중</span>
          )}
          {connectionStatus === 'error' && (
            <span style={{ color: '#EF4444' }}>연결 오류</span>
          )}
        </div>
      </header>

      <div className="meeting-controls">
        <AudioRecorder onAudioChunk={handleAudioChunk} />
        {isRecording && (
          <button
            onClick={handleEndMeeting}
            style={{
              marginTop: '12px',
              padding: '10px 20px',
              background: 'var(--gray-200)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            회의 종료
          </button>
        )}
      </div>

      <div className="meeting-content">
        <div className="left-panel">
          <TranscriptPanel />
        </div>

        <div className="right-panel">
          <div className="questions-section">
            <h3>AI 질문 제안</h3>
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
