import { useEffect, useState } from 'react';
import { meetingApi, type Meeting } from '../services/api';
import { Button, GlassCard } from './design-system';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorState } from './ui/ErrorState';
import { EmptyState } from './ui/EmptyState';
import { toast } from '../stores/toastStore';
import './MeetingHistory.css';

interface MeetingHistoryProps {
  onSelectMeeting: (meetingId: string) => void;
  onNewMeeting: () => void;
}

export function MeetingHistory({ onSelectMeeting, onNewMeeting }: MeetingHistoryProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMeetings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await meetingApi.getAll();
      setMeetings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '회의 목록을 불러오는데 실패했습니다.');
      toast.error('회의 목록 로드 실패');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}분 ${secs}초`;
  };

  if (loading) {
    return (
      <div className="history-page">
        <LoadingSpinner text="회의 목록을 불러오는 중..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-page">
        <ErrorState
          title="목록 로드 실패"
          description={error}
          onRetry={loadMeetings}
        />
      </div>
    );
  }

  return (
    <div className="history-page">
      {/* Header */}
      <header className="history-header">
        <div className="history-header__left">
          <h1 className="history-header__title">
            <span className="history-header__logo">Onno</span>
            회의 기록
          </h1>
          <p className="history-header__subtitle">
            지난 회의의 전사 기록과 AI 질문을 확인하세요
          </p>
        </div>
        <Button variant="primary" onClick={onNewMeeting}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          새 회의 시작
        </Button>
      </header>

      {/* Content */}
      <main className="history-content">
        {meetings.length === 0 ? (
          <EmptyState
            icon="📋"
            title="아직 회의 기록이 없습니다"
            description="새 회의를 시작하여 AI 질문 제안 기능을 사용해 보세요."
            action={{ label: '새 회의 시작', onClick: onNewMeeting }}
          />
        ) : (
          <div className="history-grid">
            {meetings.map((meeting) => (
              <GlassCard
                key={meeting.id}
                padding="none"
                className="history-card"
                onClick={() => onSelectMeeting(meeting.id)}
              >
                <div className="history-card__header">
                  <div className="history-card__title-row">
                    <h3 className="history-card__title">
                      {meeting.title || '제목 없는 회의'}
                    </h3>
                    <span className={`history-card__status history-card__status--${meeting.status === 'ACTIVE' ? 'active' : 'ended'}`}>
                      {meeting.status === 'ACTIVE' ? (
                        <>
                          <span className="history-card__status-dot" />
                          진행 중
                        </>
                      ) : '종료됨'}
                    </span>
                  </div>
                  <p className="history-card__date">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {formatDate(meeting.startedAt)}
                    <span className="history-card__time">{formatTime(meeting.startedAt)}</span>
                  </p>
                </div>

                <div className="history-card__body">
                  <div className="history-card__stats">
                    <div className="history-card__stat">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span className="history-card__stat-value">{formatDuration(meeting.duration)}</span>
                    </div>
                    {meeting._count && (
                      <>
                        <div className="history-card__stat">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          <span className="history-card__stat-value">{meeting._count.transcripts}</span>
                          <span className="history-card__stat-label">전사</span>
                        </div>
                        <div className="history-card__stat">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
                          </svg>
                          <span className="history-card__stat-value">{meeting._count.questions}</span>
                          <span className="history-card__stat-label">질문</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="history-card__footer">
                  <span className="history-card__view-link">
                    상세 보기
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
