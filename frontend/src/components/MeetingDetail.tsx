import { useEffect, useState } from 'react';
import { meetingApi, type MeetingDetail as MeetingDetailType } from '../services/api';
import { GlassCard } from './design-system';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorState } from './ui/ErrorState';
import './MeetingDetail.css';

interface MeetingDetailProps {
  meetingId: string;
  onBack: () => void;
}

// Category 색상 매핑
const CATEGORY_CONFIG: Record<string, { color: string; label: string }> = {
  business_model: { color: 'var(--color-cat-business)', label: '비즈니스' },
  traction: { color: 'var(--color-cat-traction)', label: '성과' },
  team: { color: 'var(--color-cat-team)', label: '팀' },
  market: { color: 'var(--color-cat-market)', label: '시장' },
  technology: { color: 'var(--color-cat-technology)', label: '기술' },
  financials: { color: 'var(--color-cat-financials)', label: '재무' },
  risks: { color: 'var(--color-cat-risks)', label: '리스크' },
  general: { color: 'var(--color-cat-general)', label: '일반' },
};

// 화자 색상
const SPEAKER_COLORS = [
  'var(--color-success)',
  'var(--color-primary)',
  'var(--color-insight)',
  '#9C27B0',
  '#00BCD4',
];

export function MeetingDetail({ meetingId, onBack }: MeetingDetailProps) {
  const [meeting, setMeeting] = useState<MeetingDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [speakerColorMap, setSpeakerColorMap] = useState<Record<string, string>>({});

  useEffect(() => {
    loadMeeting();
  }, [meetingId]);

  const loadMeeting = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await meetingApi.getById(meetingId);
      setMeeting(data);

      // 화자별 색상 할당
      const speakers = [...new Set(data.transcripts.map(t => t.speaker).filter(Boolean))];
      const colorMap: Record<string, string> = {};
      speakers.forEach((speaker, idx) => {
        if (speaker) {
          colorMap[speaker] = SPEAKER_COLORS[idx % SPEAKER_COLORS.length];
        }
      });
      setSpeakerColorMap(colorMap);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="detail-page">
        <LoadingSpinner text="회의 정보를 불러오는 중..." />
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="detail-page">
        <ErrorState
          title="회의 로드 실패"
          description={error || '회의를 찾을 수 없습니다.'}
          onRetry={loadMeeting}
        />
      </div>
    );
  }

  return (
    <div className="detail-page">
      {/* Header */}
      <header className="detail-header">
        <div className="detail-header__left">
          <button className="detail-header__back" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="detail-header__info">
            <h1 className="detail-header__title">
              {meeting.title || '제목 없는 회의'}
            </h1>
            <div className="detail-header__meta">
              <span className="detail-header__date">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {formatDate(meeting.startedAt)}
              </span>
              <span className="detail-header__duration">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {formatDuration(meeting.duration)}
              </span>
            </div>
          </div>
        </div>
        <span className={`detail-header__status detail-header__status--${meeting.status === 'ACTIVE' ? 'active' : 'ended'}`}>
          {meeting.status === 'ACTIVE' ? (
            <>
              <span className="detail-header__status-dot" />
              진행 중
            </>
          ) : '종료됨'}
        </span>
      </header>

      {/* Content */}
      <main className="detail-content">
        {/* Transcript Panel */}
        <GlassCard padding="none" className="detail-panel detail-panel--transcript">
          <div className="detail-panel__header">
            <h2 className="detail-panel__title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              전사 기록
              <span className="detail-panel__count">{meeting.transcripts.length}</span>
            </h2>
          </div>
          <div className="detail-panel__content">
            {meeting.transcripts.length === 0 ? (
              <div className="detail-empty">
                <p>전사 기록이 없습니다.</p>
              </div>
            ) : (
              <div className="transcript-list-v2">
                {meeting.transcripts.map((t) => (
                  <div
                    key={t.id}
                    className="transcript-item-v2"
                    style={{ '--speaker-color': speakerColorMap[t.speaker || ''] || 'var(--color-primary)' } as React.CSSProperties}
                  >
                    <div className="transcript-item-v2__header">
                      <span className="transcript-item-v2__speaker">
                        {t.speaker || '화자 미상'}
                        {t.speakerRole && (
                          <span className="transcript-item-v2__role">
                            {t.speakerRole === 'investor' ? '투자자' : t.speakerRole === 'founder' ? '창업자' : ''}
                          </span>
                        )}
                      </span>
                      {t.startTime !== undefined && t.startTime !== null && (
                        <span className="transcript-item-v2__time">{formatTime(t.startTime)}</span>
                      )}
                    </div>
                    <p className="transcript-item-v2__text">{t.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>

        {/* Questions Panel */}
        <GlassCard padding="none" className="detail-panel detail-panel--questions">
          <div className="detail-panel__header">
            <h2 className="detail-panel__title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
              </svg>
              AI 질문
              <span className="detail-panel__count">{meeting.questions.length}</span>
            </h2>
          </div>
          <div className="detail-panel__content">
            {meeting.questions.length === 0 ? (
              <div className="detail-empty">
                <p>생성된 질문이 없습니다.</p>
              </div>
            ) : (
              <div className="questions-list-v2">
                {meeting.questions.map((q) => {
                  const category = CATEGORY_CONFIG[q.category || 'general'] || CATEGORY_CONFIG.general;
                  return (
                    <div
                      key={q.id}
                      className={`question-item-v2 ${q.isUsed ? 'question-item-v2--used' : ''}`}
                    >
                      <div className="question-item-v2__header">
                        {q.category && (
                          <span
                            className="question-item-v2__category"
                            style={{ '--category-color': category.color } as React.CSSProperties}
                          >
                            {category.label}
                          </span>
                        )}
                        {q.isUsed && (
                          <span className="question-item-v2__used">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            사용됨
                          </span>
                        )}
                      </div>
                      <p className="question-item-v2__text">{q.text}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </GlassCard>
      </main>
    </div>
  );
}
