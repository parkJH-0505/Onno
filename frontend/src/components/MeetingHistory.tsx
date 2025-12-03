import { useEffect, useState } from 'react';
import { meetingApi, type Meeting } from '../services/api';
import { PageLayout, PageHeader, Card } from './layout';
import { Button } from './design-system';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorState } from './ui/ErrorState';
import { EmptyState } from './ui/EmptyState';
import { toast } from '../stores/toastStore';
import './MeetingHistory.css';

interface MeetingHistoryProps {
  onSelectMeeting: (meetingId: string) => void;
  onNewMeeting: () => void;
  onGoToRelationships?: () => void;
}

// 날짜 포맷팅
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return '오늘';
  } else if (diffDays === 1) {
    return '어제';
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else {
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  }
}

// 시간 포맷팅
function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 회의 시간 포맷팅
function formatDuration(startedAt: string, endedAt?: string): string {
  if (!endedAt) return '진행 중';

  const start = new Date(startedAt);
  const end = new Date(endedAt);
  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.round(diffMs / (1000 * 60));

  if (diffMins < 60) {
    return `${diffMins}분`;
  } else {
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
  }
}

// 상태 한글 매핑
const STATUS_LABELS: Record<string, string> = {
  ACTIVE: '진행 중',
  ENDED: '종료',
  PROCESSING: '처리 중',
  COMPLETED: '완료',
};

// 캘린더 아이콘
const CalendarIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export function MeetingHistory({ onSelectMeeting, onNewMeeting, onGoToRelationships }: MeetingHistoryProps) {
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

  if (loading) {
    return (
      <PageLayout>
        <LoadingSpinner text="회의 목록을 불러오는 중..." />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <ErrorState
          title="목록 로드 실패"
          description={error}
          onRetry={loadMeetings}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      header={
        <PageHeader
          title="회의 기록"
          subtitle="지난 회의의 전사 기록과 AI 질문을 확인하세요"
          actions={
            <div className="history-header__actions">
              {onGoToRelationships && (
                <Button variant="secondary" size="sm" onClick={onGoToRelationships}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  관계 관리
                </Button>
              )}
              <Button variant="primary" size="sm" onClick={onNewMeeting}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                새 회의 시작
              </Button>
            </div>
          }
        />
      }
    >
      {meetings.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon />}
          title="아직 회의 기록이 없습니다"
          description="새 회의를 시작하여 AI 질문 제안 기능을 사용해 보세요."
          action={{ label: '새 회의 시작', onClick: onNewMeeting }}
        />
      ) : (
        <div className="meeting-grid">
          {meetings.map((meeting) => (
            <Card
              key={meeting.id}
              hoverable
              onClick={() => onSelectMeeting(meeting.id)}
              className="meeting-card"
            >
              <div className="meeting-card__header">
                <h3 className="meeting-card__title">
                  {meeting.title || '제목 없는 회의'}
                </h3>
                <span className={`meeting-card__status meeting-card__status--${meeting.status.toLowerCase()}`}>
                  {meeting.status === 'ACTIVE' && (
                    <span className="meeting-card__status-dot" />
                  )}
                  {STATUS_LABELS[meeting.status] || meeting.status}
                </span>
              </div>

              <div className="meeting-card__info">
                <span className="meeting-card__date">{formatDate(meeting.startedAt)}</span>
                <span className="meeting-card__divider">·</span>
                <span className="meeting-card__time">{formatTime(meeting.startedAt)}</span>
              </div>

              <div className="meeting-card__stats">
                <div className="meeting-card__stat">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{formatDuration(meeting.startedAt, meeting.endedAt || undefined)}</span>
                </div>
                {meeting._count && (
                  <>
                    <div className="meeting-card__stat">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span>{meeting._count.transcripts} 전사</span>
                    </div>
                    <div className="meeting-card__stat">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
                      </svg>
                      <span>{meeting._count.questions} 질문</span>
                    </div>
                  </>
                )}
              </div>

              <div className="meeting-card__footer">
                <span className="meeting-card__link">
                  상세 보기
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
