import { useEffect, useState } from 'react';
import { relationshipApi, type RelationshipObject } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import './RecentRelationships.css';

interface RecentRelationshipsProps {
  onSelectRelationship: (id: string) => void;
  onViewAll: () => void;
}

// 산업 한글 매핑
const INDUSTRY_LABELS: Record<string, string> = {
  B2B_SAAS: 'B2B SaaS',
  B2C_APP: 'B2C 앱',
  ECOMMERCE: '이커머스',
  FINTECH: '핀테크',
  HEALTHTECH: '헬스테크',
  EDTECH: '에듀테크',
  PROPTECH: '프롭테크',
  LOGISTICS: '물류',
  AI_ML: 'AI/ML',
  BIOTECH: '바이오',
  OTHER: '기타',
};

// 스테이지 한글 매핑
const STAGE_LABELS: Record<string, string> = {
  PRE_SEED: 'Pre-Seed',
  SEED: 'Seed',
  SERIES_A: 'Series A',
  SERIES_B: 'Series B',
  SERIES_C_PLUS: 'Series C+',
  GROWTH: 'Growth',
  IPO: 'IPO',
  OTHER: '기타',
};

export function RecentRelationships({
  onSelectRelationship,
  onViewAll,
}: RecentRelationshipsProps) {
  const { user } = useAuthStore();
  const [relationships, setRelationships] = useState<RelationshipObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const loadRelationships = async () => {
      try {
        setIsLoading(true);
        const data = await relationshipApi.getAll({
          userId: user.id,
          limit: 3,
        });
        setRelationships(data || []);
      } catch (err) {
        console.error('Failed to load relationships:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadRelationships();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="recent-relationships">
        <div className="recent-relationships__header">
          <h2 className="recent-relationships__title">👥 최근 관계</h2>
        </div>
        <div className="recent-relationships__grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="relationship-mini-card relationship-mini-card--skeleton">
              <div className="skeleton-line skeleton-line--short" />
              <div className="skeleton-line skeleton-line--medium" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (relationships.length === 0) {
    return (
      <div className="recent-relationships">
        <div className="recent-relationships__header">
          <h2 className="recent-relationships__title">👥 최근 관계</h2>
        </div>
        <div className="recent-relationships__empty">
          <p>아직 등록된 관계가 없습니다</p>
          <button className="recent-relationships__add-btn" onClick={onViewAll}>
            + 첫 관계 추가하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-relationships">
      <div className="recent-relationships__header">
        <h2 className="recent-relationships__title">👥 최근 관계</h2>
        <button className="recent-relationships__view-all" onClick={onViewAll}>
          전체보기
        </button>
      </div>
      <div className="recent-relationships__grid">
        {relationships.map((rel) => (
          <div
            key={rel.id}
            className="relationship-mini-card"
            onClick={() => onSelectRelationship(rel.id)}
          >
            <div className="relationship-mini-card__name">{rel.name}</div>
            <div className="relationship-mini-card__meta">
              {rel.stage && (
                <span className="relationship-mini-card__stage">
                  {STAGE_LABELS[rel.stage] || rel.stage}
                </span>
              )}
              {rel.industry && (
                <span className="relationship-mini-card__industry">
                  {INDUSTRY_LABELS[rel.industry] || rel.industry}
                </span>
              )}
            </div>
            {rel._count && (
              <div className="relationship-mini-card__meetings">
                {rel._count.meetings}회 미팅
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
