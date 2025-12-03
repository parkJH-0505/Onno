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
      <div className="level-summary-card level-summary-card--loading">
        <div className="level-summary-card__skeleton">
          <div className="skeleton-line skeleton-line--short" />
          <div className="skeleton-line skeleton-line--long" />
          <div className="skeleton-line skeleton-line--medium" />
        </div>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="level-summary-card level-summary-card--empty">
        <div className="level-summary-card__empty-icon">📊</div>
        <p className="level-summary-card__empty-text">
          {error || '회의를 진행하면 레벨이 시작됩니다!'}
        </p>
      </div>
    );
  }

  // 주요 도메인 (가장 높은 레벨)
  const primaryDomain = progress.allDomains?.[0];

  if (!primaryDomain) {
    return (
      <div className="level-summary-card level-summary-card--empty">
        <div className="level-summary-card__empty-icon">🚀</div>
        <p className="level-summary-card__empty-text">
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

  // 레벨 스타 표시
  const stars = Array(5)
    .fill(0)
    .map((_, i) => (i < currentLevel ? '⭐' : '☆'))
    .join('');

  return (
    <div className="level-summary-card">
      <div className="level-summary-card__header">
        <span className="level-summary-card__domain">
          {DOMAIN_LABELS[primaryDomain.domain] || primaryDomain.domain}
        </span>
        <span className="level-summary-card__level">
          {stars} Lv.{currentLevel}
        </span>
      </div>

      <div className="level-summary-card__progress">
        <div className="level-summary-card__progress-bar">
          <div
            className="level-summary-card__progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="level-summary-card__progress-text">
          {currentXp} / {nextLevelXp} XP
        </span>
      </div>

      <div className="level-summary-card__footer">
        <span className="level-summary-card__hint">
          {currentLevel < 5
            ? `다음 레벨까지 ${nextLevelXp - currentXp} XP`
            : '최고 레벨 달성!'}
        </span>
        {onViewDetails && (
          <button
            className="level-summary-card__details-btn"
            onClick={onViewDetails}
          >
            상세보기 →
          </button>
        )}
      </div>
    </div>
  );
}
