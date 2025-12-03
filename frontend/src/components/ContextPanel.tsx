import { useState, useEffect } from 'react';
import { relationshipApi, type RelationshipContext } from '../services/api';
import { GlassCard } from './design-system';
import './ContextPanel.css';

interface ContextPanelProps {
  relationshipId: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function ContextPanel({ relationshipId, isCollapsed, onToggle }: ContextPanelProps) {
  const [context, setContext] = useState<RelationshipContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContext();
  }, [relationshipId]);

  const loadContext = async () => {
    try {
      setLoading(true);
      const data = await relationshipApi.getContext(relationshipId);
      setContext(data);
      setError(null);
    } catch (err) {
      setError('맥락을 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="context-panel context-panel--loading">
        <div className="context-panel__spinner" />
        <span>맥락 로딩 중...</span>
      </div>
    );
  }

  if (error || !context) {
    return (
      <div className="context-panel context-panel--error">
        <span>{error || '맥락을 불러올 수 없습니다.'}</span>
      </div>
    );
  }

  const { relationship, structuredData, recentMeetings, nextMeetingNumber } = context;

  // 구조화 데이터에서 표시할 주요 지표 추출
  const metrics = Object.entries(structuredData)
    .filter(([key]) => !key.startsWith('_'))
    .slice(0, 4);

  return (
    <GlassCard className={`context-panel ${isCollapsed ? 'context-panel--collapsed' : ''}`}>
      <div className="context-panel__header">
        <div className="context-panel__title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20V10M18 20V4M6 20v-4" />
          </svg>
          <span>맥락 정보</span>
          <span className="context-panel__meeting-number">{nextMeetingNumber}차 미팅</span>
        </div>
        {onToggle && (
          <button className="context-panel__toggle" onClick={onToggle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isCollapsed ? <path d="M15 19l-7-7 7-7" /> : <path d="M9 5l7 7-7 7" />}
            </svg>
          </button>
        )}
      </div>

      {!isCollapsed && (
        <div className="context-panel__content">
          {/* 기본 정보 */}
          <div className="context-panel__section">
            <div className="context-panel__info">
              <span className="context-panel__type">{relationship.type}</span>
              {relationship.industry && (
                <span className="context-panel__industry">{relationship.industry}</span>
              )}
              {relationship.stage && (
                <span className="context-panel__stage">{relationship.stage}</span>
              )}
            </div>
          </div>

          {/* 핵심 지표 */}
          {metrics.length > 0 && (
            <div className="context-panel__section">
              <h4 className="context-panel__section-title">핵심 지표</h4>
              <div className="context-panel__metrics">
                {metrics.map(([key, value]) => (
                  <div key={key} className="context-panel__metric">
                    <span className="context-panel__metric-label">{key}</span>
                    <span className="context-panel__metric-value">
                      {typeof value === 'number' ? value.toLocaleString() : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 최근 미팅 요약 */}
          {recentMeetings.length > 0 && (
            <div className="context-panel__section">
              <h4 className="context-panel__section-title">최근 미팅</h4>
              <div className="context-panel__meetings">
                {recentMeetings.slice(0, 3).map((meeting, idx) => (
                  <div key={idx} className="context-panel__meeting">
                    <div className="context-panel__meeting-header">
                      <span className="context-panel__meeting-number-badge">
                        {meeting.meetingNumber}차
                      </span>
                      <span className="context-panel__meeting-date">
                        {new Date(meeting.date).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    {meeting.summary && (
                      <p className="context-panel__meeting-summary">{meeting.summary}</p>
                    )}
                    {meeting.keyQuestions.length > 0 && (
                      <div className="context-panel__key-questions">
                        {meeting.keyQuestions.slice(0, 2).map((q, qIdx) => (
                          <span key={qIdx} className="context-panel__key-question">
                            "{q}"
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 메모 */}
          {relationship.notes && (
            <div className="context-panel__section">
              <h4 className="context-panel__section-title">메모</h4>
              <p className="context-panel__notes">{relationship.notes}</p>
            </div>
          )}

          {/* 태그 */}
          {relationship.tags.length > 0 && (
            <div className="context-panel__tags">
              {relationship.tags.map((tag) => (
                <span key={tag} className="context-panel__tag">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
