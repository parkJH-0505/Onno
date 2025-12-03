import { useEffect, useState } from 'react';
import { relationshipApi, type RelationshipObject } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { Card } from '../layout';
import { Button } from '../design-system';
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
        <div className="recent-relationships__list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="relationship-item relationship-item--skeleton">
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
      <Card className="recent-relationships__empty">
        <div className="recent-relationships__empty-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <p className="recent-relationships__empty-text">아직 등록된 관계가 없습니다</p>
        <Button variant="primary" size="sm" onClick={onViewAll}>
          첫 관계 추가하기
        </Button>
      </Card>
    );
  }

  return (
    <div className="recent-relationships">
      <div className="recent-relationships__list">
        {relationships.map((rel) => (
          <Card
            key={rel.id}
            hoverable
            onClick={() => onSelectRelationship(rel.id)}
            className="relationship-item"
          >
            <div className="relationship-item__main">
              <h4 className="relationship-item__name">{rel.name}</h4>
              <div className="relationship-item__tags">
                {rel.stage && (
                  <span className="relationship-item__tag relationship-item__tag--stage">
                    {STAGE_LABELS[rel.stage] || rel.stage}
                  </span>
                )}
                {rel.industry && (
                  <span className="relationship-item__tag">
                    {INDUSTRY_LABELS[rel.industry] || rel.industry}
                  </span>
                )}
              </div>
            </div>
            <div className="relationship-item__meta">
              {rel._count && (
                <span className="relationship-item__count">{rel._count.meetings}회 미팅</span>
              )}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
