import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import {
  relationshipApi,
  type RelationshipObject,
  type RelationshipType,
  type RelationshipStatus,
} from '../services/api';
import { PageLayout, PageHeader, Card } from '../components/layout';
import { Button } from '../components/design-system';
import { EmptyState } from '../components/ui/EmptyState';
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

// 사람 아이콘
const PeopleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

interface RelationshipListPageProps {
  onSelectRelationship: (id: string) => void;
  onCreateRelationship: () => void;
  onStartMeeting: (relationshipId: string, relationshipName?: string) => void;
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
  };

  return (
    <PageLayout
      header={
        <PageHeader
          title="관계 관리"
          subtitle="스타트업, 고객사, 파트너와의 관계를 관리하세요"
          actions={
            <div className="relationship-header__actions">
              <Button variant="secondary" size="sm" onClick={onGoToHistory}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 8v4l3 3" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                회의 히스토리
              </Button>
              <Button variant="primary" size="sm" onClick={onCreateRelationship}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                새 관계 추가
              </Button>
            </div>
          }
        />
      }
    >
      {/* 필터 바 */}
      <div className="relationship-filters">
        <div className="relationship-filters__search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="이름으로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as RelationshipType | '')}
          className="relationship-filters__select"
        >
          <option value="">모든 유형</option>
          {Object.entries(TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as RelationshipStatus | '')}
          className="relationship-filters__select"
        >
          <option value="">모든 상태</option>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* 콘텐츠 */}
      {loading ? (
        <div className="relationship-loading">
          <div className="relationship-loading__spinner" />
          <span>불러오는 중...</span>
        </div>
      ) : error ? (
        <div className="relationship-error">
          <p>{error}</p>
          <Button onClick={loadRelationships} variant="secondary" size="sm">
            다시 시도
          </Button>
        </div>
      ) : relationships.length === 0 ? (
        <EmptyState
          icon={<PeopleIcon />}
          title="아직 등록된 관계가 없어요"
          description="스타트업이나 고객사를 추가해서 대화를 관리해보세요"
          action={{ label: '첫 번째 관계 추가하기', onClick: onCreateRelationship }}
        />
      ) : (
        <div className="relationship-grid">
          {relationships.map((rel) => (
            <Card
              key={rel.id}
              hoverable
              onClick={() => onSelectRelationship(rel.id)}
              className="relationship-card"
            >
              <div className="relationship-card__header">
                <h3 className="relationship-card__name">{rel.name}</h3>
                <span className={`relationship-card__status relationship-card__status--${rel.status.toLowerCase()}`}>
                  {STATUS_LABELS[rel.status]}
                </span>
              </div>

              <div className="relationship-card__meta">
                <span className="relationship-card__type">{TYPE_LABELS[rel.type]}</span>
                {rel.industry && (
                  <span className="relationship-card__tag">{rel.industry.replace(/_/g, ' ')}</span>
                )}
                {rel.stage && (
                  <span className="relationship-card__tag">{rel.stage.replace(/_/g, ' ')}</span>
                )}
              </div>

              <div className="relationship-card__stats">
                <div className="relationship-card__stat">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>{rel._count?.meetings ?? 0}회 미팅</span>
                </div>
                <div className="relationship-card__stat">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{formatDate(rel.updatedAt)}</span>
                </div>
              </div>

              {rel.tags && rel.tags.length > 0 && (
                <div className="relationship-card__tags">
                  {rel.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="relationship-card__tag-item">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="relationship-card__footer">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartMeeting(rel.id, rel.name);
                  }}
                >
                  회의 시작
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}

export default RelationshipListPage;
