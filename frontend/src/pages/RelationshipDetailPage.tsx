import { useState, useEffect } from 'react';
import {
  relationshipApi,
  type RelationshipObject,
  type RelationshipType,
  type RelationshipStatus,
  type Industry,
  type FundingStage,
} from '../services/api';
import { GlassCard, Button } from '../components/design-system';
import './RelationshipDetailPage.css';

// 라벨 매핑
const TYPE_LABELS: Record<RelationshipType, string> = {
  STARTUP: '스타트업',
  CLIENT: '고객사',
  PARTNER: '파트너',
  OTHER: '기타',
};

const STATUS_LABELS: Record<RelationshipStatus, string> = {
  ACTIVE: '활성',
  ON_HOLD: '대기중',
  PASSED: '패스',
  INVESTED: '투자완료',
  ARCHIVED: '보관됨',
};

const INDUSTRY_LABELS: Record<Industry, string> = {
  B2B_SAAS: 'B2B SaaS',
  B2C_APP: 'B2C App',
  ECOMMERCE: 'E-Commerce',
  FINTECH: 'FinTech',
  HEALTHTECH: 'HealthTech',
  EDTECH: 'EdTech',
  PROPTECH: 'PropTech',
  LOGISTICS: 'Logistics',
  AI_ML: 'AI/ML',
  BIOTECH: 'BioTech',
  OTHER: '기타',
};

const STAGE_LABELS: Record<FundingStage, string> = {
  PRE_SEED: 'Pre-Seed',
  SEED: 'Seed',
  SERIES_A: 'Series A',
  SERIES_B: 'Series B',
  SERIES_C_PLUS: 'Series C+',
  GROWTH: 'Growth',
  IPO: 'IPO',
  OTHER: '기타',
};

interface RelationshipDetailPageProps {
  relationshipId: string;
  onBack: () => void;
  onStartMeeting: (relationshipId: string) => void;
  onEdit: (relationship: RelationshipObject) => void;
}

export function RelationshipDetailPage({
  relationshipId,
  onBack,
  onStartMeeting,
  onEdit,
}: RelationshipDetailPageProps) {
  const [relationship, setRelationship] = useState<RelationshipObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRelationship();
  }, [relationshipId]);

  const loadRelationship = async () => {
    try {
      setLoading(true);
      const data = await relationshipApi.getById(relationshipId);
      setRelationship(data);
      setError(null);
    } catch (err) {
      setError('관계 정보를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    return `${mins}분`;
  };

  if (loading) {
    return (
      <div className="relationship-detail-page">
        <div className="relationship-detail-page__loading">
          <div className="spinner" />
          <span>불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (error || !relationship) {
    return (
      <div className="relationship-detail-page">
        <div className="relationship-detail-page__error">
          <p>{error || '관계를 찾을 수 없습니다.'}</p>
          <Button onClick={onBack} variant="secondary">
            돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const structuredData = relationship.structuredData as Record<string, unknown> | undefined;

  return (
    <div className="relationship-detail-page">
      <header className="relationship-detail-page__header">
        <button className="relationship-detail-page__back" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          목록으로
        </button>

        <div className="relationship-detail-page__actions">
          <Button variant="secondary" onClick={() => onEdit(relationship)}>
            편집
          </Button>
          <Button variant="primary" onClick={() => onStartMeeting(relationship.id)}>
            회의 시작
          </Button>
        </div>
      </header>

      <div className="relationship-detail-page__content">
        {/* 기본 정보 */}
        <GlassCard className="relationship-detail-page__info-card">
          <div className="relationship-detail-page__info-header">
            <h1 className="relationship-detail-page__name">{relationship.name}</h1>
            <span className={`relationship-detail-page__status status--${relationship.status.toLowerCase()}`}>
              {STATUS_LABELS[relationship.status]}
            </span>
          </div>

          <div className="relationship-detail-page__meta">
            <div className="relationship-detail-page__meta-item">
              <span className="relationship-detail-page__meta-label">유형</span>
              <span className="relationship-detail-page__meta-value">{TYPE_LABELS[relationship.type]}</span>
            </div>
            {relationship.industry && (
              <div className="relationship-detail-page__meta-item">
                <span className="relationship-detail-page__meta-label">산업</span>
                <span className="relationship-detail-page__meta-value">{INDUSTRY_LABELS[relationship.industry]}</span>
              </div>
            )}
            {relationship.stage && (
              <div className="relationship-detail-page__meta-item">
                <span className="relationship-detail-page__meta-label">단계</span>
                <span className="relationship-detail-page__meta-value">{STAGE_LABELS[relationship.stage]}</span>
              </div>
            )}
            <div className="relationship-detail-page__meta-item">
              <span className="relationship-detail-page__meta-label">총 회의</span>
              <span className="relationship-detail-page__meta-value">{relationship._count?.meetings ?? 0}회</span>
            </div>
          </div>

          {relationship.tags && relationship.tags.length > 0 && (
            <div className="relationship-detail-page__tags">
              {relationship.tags.map((tag) => (
                <span key={tag} className="relationship-detail-page__tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {relationship.notes && (
            <div className="relationship-detail-page__notes">
              <h4>메모</h4>
              <p>{relationship.notes}</p>
            </div>
          )}
        </GlassCard>

        {/* 핵심 지표 */}
        {structuredData && Object.keys(structuredData).length > 0 && (
          <GlassCard className="relationship-detail-page__metrics-card">
            <h3>핵심 지표</h3>
            <div className="relationship-detail-page__metrics-grid">
              {Object.entries(structuredData)
                .filter(([key]) => !key.startsWith('_'))
                .map(([key, value]) => (
                  <div key={key} className="relationship-detail-page__metric">
                    <span className="relationship-detail-page__metric-label">
                      {key.toUpperCase()}
                    </span>
                    <span className="relationship-detail-page__metric-value">
                      {typeof value === 'number'
                        ? value.toLocaleString()
                        : String(value)}
                    </span>
                  </div>
                ))}
            </div>
          </GlassCard>
        )}

        {/* 미팅 히스토리 */}
        <GlassCard className="relationship-detail-page__meetings-card">
          <h3>미팅 히스토리</h3>
          {relationship.meetings && relationship.meetings.length > 0 ? (
            <div className="relationship-detail-page__meetings-list">
              {relationship.meetings.map((meeting) => (
                <div key={meeting.id} className="relationship-detail-page__meeting-item">
                  <div className="relationship-detail-page__meeting-info">
                    <span className="relationship-detail-page__meeting-number">
                      {meeting.meetingNumber}차 미팅
                    </span>
                    <span className="relationship-detail-page__meeting-date">
                      {formatDate(meeting.startedAt)}
                    </span>
                  </div>
                  <div className="relationship-detail-page__meeting-meta">
                    <span className="relationship-detail-page__meeting-duration">
                      {formatDuration(meeting.duration)}
                    </span>
                    <span className="relationship-detail-page__meeting-stats">
                      전사 {meeting._count?.transcripts ?? 0}개 · 질문 {meeting._count?.questions ?? 0}개
                    </span>
                  </div>
                  {meeting.summary && (
                    <p className="relationship-detail-page__meeting-summary">
                      {meeting.summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="relationship-detail-page__meetings-empty">
              <p>아직 진행된 미팅이 없습니다.</p>
              <Button variant="primary" onClick={() => onStartMeeting(relationship.id)}>
                첫 번째 미팅 시작하기
              </Button>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

export default RelationshipDetailPage;
