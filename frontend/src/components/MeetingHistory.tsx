import { useEffect, useState } from 'react';
import { meetingApi, type Meeting } from '../services/api';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorState } from './ui/ErrorState';
import { EmptyState } from './ui/EmptyState';
import { toast } from '../stores/toastStore';

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
      <div className="meeting-history">
        <LoadingSpinner text="회의 목록을 불러오는 중..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="meeting-history">
        <ErrorState
          title="목록 로드 실패"
          description={error}
          onRetry={loadMeetings}
        />
      </div>
    );
  }

  return (
    <div className="meeting-history">
      <header className="history-header">
        <h1>회의 기록</h1>
        <button className="btn-new-meeting" onClick={onNewMeeting}>
          + 새 회의
        </button>
      </header>

      {meetings.length === 0 ? (
        <EmptyState
          icon="📋"
          title="아직 회의 기록이 없습니다"
          description="새 회의를 시작하여 AI 질문 제안 기능을 사용해 보세요."
          action={{ label: '새 회의 시작', onClick: onNewMeeting }}
        />
      ) : (
        <div className="meetings-grid">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="meeting-card"
              onClick={() => onSelectMeeting(meeting.id)}
            >
              <div className="meeting-card-header">
                <h3 className="meeting-card-title">
                  {meeting.title || '제목 없는 회의'}
                </h3>
                <span
                  className={`meeting-card-status ${
                    meeting.status === 'ACTIVE' ? 'active' : 'ended'
                  }`}
                >
                  {meeting.status === 'ACTIVE' ? '진행 중' : '종료됨'}
                </span>
              </div>

              <p className="meeting-card-date">{formatDate(meeting.startedAt)}</p>

              <div className="meeting-card-stats">
                <span className="meeting-stat">
                  소요 시간:{' '}
                  <span className="meeting-stat-value">
                    {formatDuration(meeting.duration)}
                  </span>
                </span>
                {meeting._count && (
                  <>
                    <span className="meeting-stat">
                      전사:{' '}
                      <span className="meeting-stat-value">
                        {meeting._count.transcripts}개
                      </span>
                    </span>
                    <span className="meeting-stat">
                      질문:{' '}
                      <span className="meeting-stat-value">
                        {meeting._count.questions}개
                      </span>
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
