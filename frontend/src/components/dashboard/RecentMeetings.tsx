import { useEffect, useState } from 'react';
import { meetingApi, type Meeting } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { Card } from '../layout';
import { Button } from '../design-system';
import './RecentMeetings.css';

interface RecentMeetingsProps {
  onSelectMeeting: (id: string) => void;
  onNewMeeting: () => void;
}

// 회의 상태 한글 매핑
const STATUS_LABELS: Record<string, string> = {
  ACTIVE: '진행 중',
  ENDED: '종료',
  PROCESSING: '처리 중',
  COMPLETED: '완료',
};

// 날짜 포맷팅
function formatDate(dateString: string): string {
  const date = new Date(dateString);
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

export function RecentMeetings({
  onSelectMeeting,
  onNewMeeting,
}: RecentMeetingsProps) {
  const { user } = useAuthStore();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const loadMeetings = async () => {
      try {
        setIsLoading(true);
        const allMeetings = await meetingApi.getAll();
        setMeetings(allMeetings.slice(0, 3));
      } catch (err) {
        console.error('Failed to load meetings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMeetings();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="recent-meetings">
        <div className="recent-meetings__list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="meeting-item meeting-item--skeleton">
              <div className="skeleton-line skeleton-line--medium" />
              <div className="skeleton-line skeleton-line--short" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <Card className="recent-meetings__empty">
        <div className="recent-meetings__empty-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <p className="recent-meetings__empty-text">아직 진행된 회의가 없습니다</p>
        <Button variant="primary" size="sm" onClick={onNewMeeting}>
          첫 회의 시작하기
        </Button>
      </Card>
    );
  }

  return (
    <div className="recent-meetings">
      <div className="recent-meetings__list">
        {meetings.map((meeting) => (
          <Card
            key={meeting.id}
            hoverable
            onClick={() => onSelectMeeting(meeting.id)}
            className="meeting-item"
          >
            <div className="meeting-item__main">
              <div className="meeting-item__header">
                <h4 className="meeting-item__title">
                  {meeting.title || '제목 없는 회의'}
                </h4>
                <span className={`meeting-item__status meeting-item__status--${meeting.status.toLowerCase()}`}>
                  {STATUS_LABELS[meeting.status] || meeting.status}
                </span>
              </div>
              <div className="meeting-item__info">
                <span className="meeting-item__date">{formatDate(meeting.startedAt)}</span>
                <span className="meeting-item__divider">·</span>
                <span className="meeting-item__duration">
                  {formatDuration(meeting.startedAt, meeting.endedAt || undefined)}
                </span>
                {meeting._count && (
                  <>
                    <span className="meeting-item__divider">·</span>
                    <span className="meeting-item__stats">
                      전사 {meeting._count.transcripts}건
                    </span>
                  </>
                )}
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="meeting-item__arrow">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Card>
        ))}
      </div>
    </div>
  );
}
