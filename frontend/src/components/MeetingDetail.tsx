import { useEffect, useState } from 'react';
import { meetingApi, type MeetingDetail as MeetingDetailType } from '../services/api';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorState } from './ui/ErrorState';

interface MeetingDetailProps {
  meetingId: string;
  onBack: () => void;
}

export function MeetingDetail({ meetingId, onBack }: MeetingDetailProps) {
  const [meeting, setMeeting] = useState<MeetingDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMeeting();
  }, [meetingId]);

  const loadMeeting = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await meetingApi.getById(meetingId);
      setMeeting(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '회의를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
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
      <div className="meeting-room">
        <LoadingSpinner text="회의 정보를 불러오는 중..." />
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="meeting-room">
        <ErrorState
          title="회의 로드 실패"
          description={error || '회의를 찾을 수 없습니다.'}
          onRetry={loadMeeting}
        />
      </div>
    );
  }

  return (
    <div className="meeting-room">
      <header className="meeting-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
          <div>
            <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>
              {meeting.title || '제목 없는 회의'}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--gray-500)', margin: 0 }}>
              {formatDate(meeting.startedAt)} · {formatDuration(meeting.duration)}
            </p>
          </div>
        </div>
        <span
          className={`meeting-card-status ${meeting.status === 'ACTIVE' ? 'active' : 'ended'}`}
        >
          {meeting.status === 'ACTIVE' ? '진행 중' : '종료됨'}
        </span>
      </header>

      <div className="meeting-content">
        <div className="left-panel">
          <div className="transcript-panel">
            <h3>전사 기록 ({meeting.transcripts.length})</h3>
            <div className="transcript-list">
              {meeting.transcripts.length === 0 ? (
                <p className="empty-state">전사 기록이 없습니다.</p>
              ) : (
                meeting.transcripts.map((t) => (
                  <div key={t.id} className="segment-item" style={{ borderColor: 'var(--primary)' }}>
                    <div className="segment-header">
                      <span className="segment-speaker">
                        {t.speaker || '화자 미상'}
                        {t.speakerRole && (
                          <span className="segment-role">({t.speakerRole})</span>
                        )}
                      </span>
                      <span className="segment-time">
                        {t.startTime ? `${Math.floor(t.startTime / 60)}:${String(Math.floor(t.startTime % 60)).padStart(2, '0')}` : ''}
                      </span>
                    </div>
                    <p className="segment-text">{t.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="questions-section">
            <h3>AI 질문 ({meeting.questions.length})</h3>
            <div className="questions-list">
              {meeting.questions.length === 0 ? (
                <p className="empty-state">생성된 질문이 없습니다.</p>
              ) : (
                meeting.questions.map((q) => (
                  <div
                    key={q.id}
                    className={`question-card ${q.isUsed ? 'used' : ''}`}
                    style={{ borderColor: 'var(--primary)' }}
                  >
                    <div className="question-header">
                      {q.category && (
                        <span className="category-badge">{q.category}</span>
                      )}
                      {q.isUsed && (
                        <span className="priority-badge" style={{ background: 'var(--success)' }}>
                          사용됨
                        </span>
                      )}
                    </div>
                    <p className="question-text">{q.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
