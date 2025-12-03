import { useEffect, useState } from 'react';
import { personalizationApi, type UserProgress } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import './LevelSummaryCard.css';

interface LevelSummaryCardProps {
  onViewDetails?: () => void;
}

// 도메인 타입 한글 매핑
const DOMAIN_LABELS: Record<string, string> = {
  INVESTMENT_SCREENING: '투자 심사',
  MENTORING: '멘토링',
  SALES: '세일즈',
  PRODUCT_REVIEW: '제품 리뷰',
  TEAM_MEETING: '팀 미팅',
  USER_INTERVIEW: '사용자 인터뷰',
  GENERAL: '일반',
};

// 레벨별 XP 요구사항
const LEVEL_XP: Record<number, number> = {
  1: 0,
  2: 100,
  3: 300,
  4: 700,
  5: 1500,
};

export function LevelSummaryCard({ onViewDetails }: LevelSummaryCardProps) {
  const { user } = useAuthStore();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const loadProgress = async () => {
      try {
        setIsLoading(true);
        const data = await personalizationApi.getProgress(user.id);
        setProgress(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load user progress:', err);
        setError('레벨 정보를 불러올 수 없습니다');
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="level-card level-card--loading">
        <div className="level-card__skeleton">
          <div className="skeleton-line skeleton-line--short" />
          <div className="skeleton-line skeleton-line--long" />
          <div className="skeleton-line skeleton-line--medium" />
        </div>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="level-card level-card--empty">
        <div className="level-card__empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </div>
        <p className="level-card__empty-text">
          {error || '회의를 진행하면 레벨이 시작됩니다!'}
        </p>
      </div>
    );
  }

  const primaryDomain = progress.allDomains?.[0];

  if (!primaryDomain) {
    return (
      <div className="level-card level-card--empty">
        <div className="level-card__empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <p className="level-card__empty-text">
          첫 회의를 시작해서 레벨을 올려보세요!
        </p>
      </div>
    );
  }

  const currentLevel = primaryDomain.level;
  const currentXp = primaryDomain.xp;
  const nextLevelXp = LEVEL_XP[currentLevel + 1] || LEVEL_XP[5];
  const currentLevelXp = LEVEL_XP[currentLevel] || 0;
  const progressPercent = Math.min(
    ((currentXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100,
    100
  );

  return (
    <div className="level-card">
      <div className="level-card__header">
        <div className="level-card__domain">
          <span className="level-card__domain-label">주요 분야</span>
          <span className="level-card__domain-name">
            {DOMAIN_LABELS[primaryDomain.domain] || primaryDomain.domain}
          </span>
        </div>
        <div className="level-card__level">
          <span className="level-card__level-value">Lv.{currentLevel}</span>
          <div className="level-card__stars">
            {Array(5).fill(0).map((_, i) => (
              <svg
                key={i}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill={i < currentLevel ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                className={i < currentLevel ? 'star--filled' : 'star--empty'}
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>
        </div>
      </div>

      <div className="level-card__progress">
        <div className="level-card__progress-bar">
          <div
            className="level-card__progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="level-card__progress-info">
          <span className="level-card__xp">{currentXp} / {nextLevelXp} XP</span>
          <span className="level-card__hint">
            {currentLevel < 5
              ? `다음 레벨까지 ${nextLevelXp - currentXp} XP`
              : '최고 레벨 달성!'}
          </span>
        </div>
      </div>

      {onViewDetails && (
        <button className="level-card__details-btn" onClick={onViewDetails}>
          상세보기
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}
    </div>
  );
}
