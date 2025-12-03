import { useEffect, useState } from 'react';
import { AudioRecorder } from './AudioRecorder';
import { TranscriptPanel } from './TranscriptPanel';
import { QuestionCard } from './design-system/QuestionCard';
import { Button, GlassCard, InlineRecordButton } from './design-system';
import { useMeetingStore } from '../stores/meetingStore';
import { toast } from '../stores/toastStore';
import websocketService from '../services/websocket';
import './MeetingRoom.css';

interface MeetingRoomProps {
  onBack?: () => void;
}

export function MeetingRoom({ onBack }: MeetingRoomProps) {
  const { questions, isRecording, reset } = useMeetingStore();
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [meetingId] = useState(() => 'meeting-' + Date.now());
  const [duration, setDuration] = useState('00:00');
  const [startTime, setStartTime] = useState<number | null>(null);

  const WS_URL = import.meta.env.VITE_WS_URL || 'https://onno-backend.onrender.com';
  const USER_ID = 'user-1';

  // Duration timer
  useEffect(() => {
    if (isRecording && !startTime) {
      setStartTime(Date.now());
    } else if (!isRecording) {
      setStartTime(null);
      setDuration('00:00');
    }
  }, [isRecording]);

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
      const seconds = (elapsed % 60).toString().padStart(2, '0');
      setDuration(`${minutes}:${seconds}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

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

  const activeQuestions = questions.filter((q) => q.action !== 'dismissed');

  return (
    <div className="meeting-room-v2">
      {/* Header */}
      <header className="meeting-room-v2__header">
        <div className="meeting-room-v2__header-left">
          {onBack && (
            <button className="meeting-room-v2__back-btn" onClick={onBack} title="회의 목록으로">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className="meeting-room-v2__brand">
            <span className="meeting-room-v2__logo">Onno</span>
            <span className="meeting-room-v2__tagline">조용한 파트너</span>
          </div>
        </div>

        <div className="meeting-room-v2__header-center">
          <InlineRecordButton
            isRecording={isRecording}
            onClick={() => {}}
            duration={isRecording ? duration : undefined}
            disabled
          />
        </div>

        <div className="meeting-room-v2__header-right">
          <div className="meeting-room-v2__status">
            {connectionStatus === 'connecting' && (
              <span className="meeting-room-v2__status-badge meeting-room-v2__status-badge--warning">
                연결 중...
              </span>
            )}
            {connectionStatus === 'connected' && (
              <span className="meeting-room-v2__status-badge meeting-room-v2__status-badge--success">
                연결됨
              </span>
            )}
            {connectionStatus === 'error' && (
              <span className="meeting-room-v2__status-badge meeting-room-v2__status-badge--error">
                연결 오류
              </span>
            )}
          </div>
          {isRecording && (
            <Button variant="ghost" size="sm" onClick={handleEndMeeting}>
              회의 종료
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="meeting-room-v2__main">
        {/* Left Panel - Controls & Transcript */}
        <div className="meeting-room-v2__left">
          {/* Recording Controls */}
          <GlassCard padding="lg" className="meeting-room-v2__controls">
            <AudioRecorder onAudioChunk={handleAudioChunk} />
          </GlassCard>

          {/* Transcript */}
          <GlassCard padding="none" className="meeting-room-v2__transcript">
            <div className="meeting-room-v2__panel-header">
              <h2 className="meeting-room-v2__panel-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                실시간 전사
              </h2>
            </div>
            <div className="meeting-room-v2__transcript-content">
              <TranscriptPanel />
            </div>
          </GlassCard>
        </div>

        {/* Right Panel - Questions */}
        <div className="meeting-room-v2__right">
          <GlassCard padding="none" className="meeting-room-v2__questions">
            <div className="meeting-room-v2__panel-header">
              <h2 className="meeting-room-v2__panel-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
                </svg>
                AI 질문 제안
                {activeQuestions.length > 0 && (
                  <span className="meeting-room-v2__question-count">{activeQuestions.length}</span>
                )}
              </h2>
            </div>

            <div className="meeting-room-v2__questions-content">
              {activeQuestions.length === 0 ? (
                <div className="meeting-room-v2__empty">
                  <div className="meeting-room-v2__empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  </div>
                  <p className="meeting-room-v2__empty-text">
                    녹음을 시작하면<br />AI가 질문을 제안합니다
                  </p>
                  <p className="meeting-room-v2__empty-hint">
                    대화 맥락을 분석하여 투자자 관점의<br />핵심 질문을 실시간으로 추천합니다
                  </p>
                </div>
              ) : (
                <div className="meeting-room-v2__questions-list">
                  {activeQuestions.map((q) => (
                    <QuestionCard key={q.id} question={q} />
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
