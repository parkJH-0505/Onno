import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import {
  relationshipApi,
  type RelationshipObject,
  type RelationshipType,
  type RelationshipStatus,
} from '../services/api';
import { GlassCard, Button } from '../components/design-system';
import './RelationshipListPage.css';

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

const STATUS_COLORS: Record<RelationshipStatus, string> = {
  ACTIVE: 'var(--color-success)',
  ON_HOLD: 'var(--color-warning)',
  PASSED: 'var(--color-text-tertiary)',
  INVESTED: 'var(--color-primary)',
  ARCHIVED: 'var(--color-text-tertiary)',
};

interface RelationshipListPageProps {
  onSelectRelationship: (id: string) => void;
  onCreateRelationship: () => void;
  onStartMeeting: (relationshipId: string) => void;
  onGoToHistory: () => void;
}

export function RelationshipListPage({
  onSelectRelationship,
  onCreateRelationship,
  onStartMeeting,
  onGoToHistory,
}: RelationshipListPageProps) {
  const { user } = useAuthStore();
  const [relationships, setRelationships] = useState<RelationshipObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<RelationshipType | ''>('');
  const [filterStatus, setFilterStatus] = useState<RelationshipStatus | ''>('');

  useEffect(() => {
    if (user?.id) {
      loadRelationships();
    } else {
      // 사용자가 없으면 빈 목록 표시
      setRelationships([]);
      setLoading(false);
    }
  }, [user?.id, search, filterType, filterStatus]);

  const loadRelationships = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await relationshipApi.getAll({
        userId: user.id,
        search: search || undefined,
        type: filterType || undefined,
        status: filterStatus || undefined,
      });
      setRelationships(data);
      setError(null);
    } catch (err) {
      setError('관계 목록을 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="relationship-list-page">
      <header className="relationship-list-page__header">
        <div className="relationship-list-page__title-section">
          <h1 className="relationship-list-page__title">관계 관리</h1>
          <p className="relationship-list-page__subtitle">
            스타트업, 고객사, 파트너와의 관계를 관리하세요
          </p>
        </div>
        <div className="relationship-list-page__header-actions">
          <Button onClick={onGoToHistory} variant="ghost">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4l3 3" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            회의 히스토리
          </Button>
          <Button onClick={onCreateRelationship} variant="primary">
            + 새 관계 추가
          </Button>
        </div>
      </header>

      {/* 필터 바 */}
      <div className="relationship-list-page__filters">
        <div className="relationship-list-page__search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="이름으로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="relationship-list-page__search-input"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as RelationshipType | '')}
          className="relationship-list-page__select"
        >
          <option value="">모든 유형</option>
          {Object.entries(TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as RelationshipStatus | '')}
          className="relationship-list-page__select"
        >
          <option value="">모든 상태</option>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* 목록 */}
      <div className="relationship-list-page__content">
        {loading ? (
          <div className="relationship-list-page__loading">
            <div className="spinner" />
            <span>불러오는 중...</span>
          </div>
        ) : error ? (
          <div className="relationship-list-page__error">
            <p>{error}</p>
            <Button onClick={loadRelationships} variant="secondary">
              다시 시도
            </Button>
          </div>
        ) : relationships.length === 0 ? (
          <div className="relationship-list-page__empty">
            <div className="relationship-list-page__empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3>아직 등록된 관계가 없어요</h3>
            <p>스타트업이나 고객사를 추가해서 대화를 관리해보세요</p>
            <Button onClick={onCreateRelationship} variant="primary">
              첫 번째 관계 추가하기
            </Button>
          </div>
        ) : (
          <div className="relationship-list-page__grid">
            {relationships.map((rel) => (
              <GlassCard
                key={rel.id}
                className="relationship-card"
                onClick={() => onSelectRelationship(rel.id)}
              >
                <div className="relationship-card__header">
                  <h3 className="relationship-card__name">{rel.name}</h3>
                  <span
                    className="relationship-card__status"
                    style={{ backgroundColor: STATUS_COLORS[rel.status] }}
                  >
                    {STATUS_LABELS[rel.status]}
                  </span>
                </div>

                <div className="relationship-card__meta">
                  <span className="relationship-card__type">{TYPE_LABELS[rel.type]}</span>
                  {rel.industry && (
                    <span className="relationship-card__industry">{rel.industry.replace('_', ' ')}</span>
                  )}
                  {rel.stage && (
                    <span className="relationship-card__stage">{rel.stage.replace('_', ' ')}</span>
                  )}
                </div>

                <div className="relationship-card__stats">
                  <div className="relationship-card__stat">
                    <span className="relationship-card__stat-value">
                      {rel._count?.meetings ?? 0}
                    </span>
                    <span className="relationship-card__stat-label">회의</span>
                  </div>
                  <div className="relationship-card__stat">
                    <span className="relationship-card__stat-value">
                      {formatDate(rel.updatedAt)}
                    </span>
                    <span className="relationship-card__stat-label">최근 활동</span>
                  </div>
                </div>

                {rel.tags && rel.tags.length > 0 && (
                  <div className="relationship-card__tags">
                    {rel.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="relationship-card__tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="relationship-card__actions">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartMeeting(rel.id);
                    }}
                  >
                    회의 시작
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RelationshipListPage;
