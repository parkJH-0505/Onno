import { useEffect, useState } from 'react';
import { meetingApi, type Meeting } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import './RecentMeetings.css';

interface RecentMeetingsProps {
  onSelectMeeting: (id: string) => void;
  onViewAll: () => void;
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
  onViewAll,
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
        // 최근 3개만 표시
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
        <div className="recent-meetings__header">
          <h2 className="recent-meetings__title">📅 최근 회의</h2>
        </div>
        <div className="recent-meetings__list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="meeting-mini-card meeting-mini-card--skeleton">
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
      <div className="recent-meetings">
        <div className="recent-meetings__header">
          <h2 className="recent-meetings__title">📅 최근 회의</h2>
        </div>
        <div className="recent-meetings__empty">
          <p>아직 진행된 회의가 없습니다</p>
          <button className="recent-meetings__start-btn" onClick={onNewMeeting}>
            🎙️ 첫 회의 시작하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-meetings">
      <div className="recent-meetings__header">
        <h2 className="recent-meetings__title">📅 최근 회의</h2>
        <button className="recent-meetings__view-all" onClick={onViewAll}>
          전체보기
        </button>
      </div>
      <div className="recent-meetings__list">
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            className="meeting-mini-card"
            onClick={() => onSelectMeeting(meeting.id)}
          >
            <div className="meeting-mini-card__top">
              <span className="meeting-mini-card__date">
                {formatDate(meeting.startedAt)}
              </span>
              <span
                className={`meeting-mini-card__status meeting-mini-card__status--${meeting.status.toLowerCase()}`}
              >
                {STATUS_LABELS[meeting.status] || meeting.status}
              </span>
            </div>
            <div className="meeting-mini-card__title">
              {meeting.title || '제목 없는 회의'}
            </div>
            <div className="meeting-mini-card__meta">
              <span className="meeting-mini-card__duration">
                ⏱️ {formatDuration(meeting.startedAt, meeting.endedAt || undefined)}
              </span>
              {meeting._count && (
                <span className="meeting-mini-card__stats">
                  💬 {meeting._count.transcripts} | ❓ {meeting._count.questions}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
