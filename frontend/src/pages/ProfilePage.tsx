import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import {
  personalizationApi,
  meetingApi,
  type UserProgress,
  type DomainType,
} from '../services/api';
import { PageLayout, PageHeader, Section, Card } from '../components/layout';
import { Button } from '../components/design-system';
import './ProfilePage.css';

// 도메인 타입 한글 매핑
const DOMAIN_LABELS: Record<DomainType, string> = {
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

// 레벨별 설명
const LEVEL_DESCRIPTIONS: Record<number, string> = {
  1: '입문자',
  2: '견습생',
  3: '숙련자',
  4: '전문가',
  5: '마스터',
};

interface ProfilePageProps {
  onGoBack: () => void;
  onViewDomainDetail?: (domain: DomainType) => void;
}

export function ProfilePage({ onGoBack, onViewDomainDetail }: ProfilePageProps) {
  const { user, logout } = useAuthStore();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [meetingCount, setMeetingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const [progressData, meetings] = await Promise.all([
          personalizationApi.getProgress(user.id),
          meetingApi.getAll(),
        ]);
        setProgress(progressData);
        setMeetingCount(meetings.length);
        setError(null);
      } catch (err) {
        console.error('Failed to load profile data:', err);
        setError('프로필 정보를 불러올 수 없습니다');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  const handleLogout = () => {
    logout();
    onGoBack();
  };

  if (isLoading) {
    return (
      <PageLayout
        header={
          <PageHeader
            title="프로필"
            actions={
              <Button variant="secondary" size="sm" onClick={onGoBack}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                뒤로
              </Button>
            }
          />
        }
      >
        <div className="profile-loading">
          <div className="profile-loading__spinner" />
          <span>프로필 로딩 중...</span>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      header={
        <PageHeader
          title="프로필"
          actions={
            <Button variant="secondary" size="sm" onClick={onGoBack}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              뒤로
            </Button>
          }
        />
      }
    >
      {/* 사용자 정보 카드 */}
      <Section>
        <Card className="profile-user-card">
          <div className="profile-user-card__avatar">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="profile-user-card__info">
            <h2 className="profile-user-card__name">{user?.name || '사용자'}</h2>
            <p className="profile-user-card__email">{user?.email}</p>
          </div>
          <div className="profile-user-card__stats">
            <div className="profile-user-card__stat">
              <span className="profile-user-card__stat-value">{progress?.totalXp || 0}</span>
              <span className="profile-user-card__stat-label">총 XP</span>
            </div>
            <div className="profile-user-card__stat">
              <span className="profile-user-card__stat-value">{meetingCount}</span>
              <span className="profile-user-card__stat-label">총 회의</span>
            </div>
            <div className="profile-user-card__stat">
              <span className="profile-user-card__stat-value">{progress?.allDomains?.length || 0}</span>
              <span className="profile-user-card__stat-label">활성 도메인</span>
            </div>
          </div>
        </Card>
      </Section>

      {/* 도메인별 레벨 */}
      <Section
        title="도메인 레벨"
        action={
          progress && progress.allDomains && progress.allDomains.length > 0 && (
            <span className="profile-section__hint">
              가장 활발한 분야: {DOMAIN_LABELS[progress.primaryDomain]}
            </span>
          )
        }
      >
        {error ? (
          <div className="profile-error">
            <p>{error}</p>
          </div>
        ) : !progress || !progress.allDomains || progress.allDomains.length === 0 ? (
          <Card className="profile-empty">
            <div className="profile-empty__icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <p className="profile-empty__text">
              아직 레벨이 없습니다. 회의를 진행하면 레벨이 시작됩니다!
            </p>
          </Card>
        ) : (
          <div className="profile-domains">
            {progress.allDomains.map((domain) => {
              const currentLevel = domain.level;
              const currentXp = domain.xp;
              const currentLevelXp = LEVEL_XP[currentLevel] || 0;
              const nextLevelXp = LEVEL_XP[currentLevel + 1] || LEVEL_XP[5];
              const progressPercent = Math.min(
                ((currentXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100,
                100
              );

              return (
                <Card
                  key={domain.domain}
                  hoverable={!!onViewDomainDetail}
                  onClick={onViewDomainDetail ? () => onViewDomainDetail(domain.domain) : undefined}
                  className="profile-domain-card"
                >
                  <div className="profile-domain-card__header">
                    <div className="profile-domain-card__info">
                      <h3 className="profile-domain-card__name">
                        {DOMAIN_LABELS[domain.domain]}
                      </h3>
                      <span className="profile-domain-card__description">
                        {LEVEL_DESCRIPTIONS[currentLevel]}
                      </span>
                    </div>
                    <div className="profile-domain-card__level">
                      <span className="profile-domain-card__level-value">Lv.{currentLevel}</span>
                      <div className="profile-domain-card__stars">
                        {Array(5).fill(0).map((_, i) => (
                          <svg
                            key={i}
                            width="12"
                            height="12"
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

                  <div className="profile-domain-card__progress">
                    <div className="profile-domain-card__progress-bar">
                      <div
                        className="profile-domain-card__progress-fill"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="profile-domain-card__progress-info">
                      <span className="profile-domain-card__xp">{currentXp} XP</span>
                      <span className="profile-domain-card__next">
                        {currentLevel < 5
                          ? `다음 레벨까지 ${nextLevelXp - currentXp} XP`
                          : '최고 레벨 달성'}
                      </span>
                    </div>
                  </div>

                  {domain.features && domain.features.length > 0 && (
                    <div className="profile-domain-card__features">
                      {domain.features.slice(0, 3).map((feature, i) => (
                        <span key={i} className="profile-domain-card__feature">
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </Section>

      {/* 최근 레벨업 */}
      {progress?.recentLevelUps && progress.recentLevelUps.length > 0 && (
        <Section title="최근 레벨업">
          <div className="profile-levelups">
            {progress.recentLevelUps.slice(0, 5).map((levelUp, index) => (
              <Card key={index} className="profile-levelup-card">
                <div className="profile-levelup-card__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                </div>
                <div className="profile-levelup-card__info">
                  <p className="profile-levelup-card__title">
                    {DOMAIN_LABELS[levelUp.domain]} 레벨업!
                  </p>
                  <p className="profile-levelup-card__detail">
                    Lv.{levelUp.oldLevel} → Lv.{levelUp.newLevel}
                  </p>
                </div>
                <span className="profile-levelup-card__date">
                  {new Date(levelUp.createdAt).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* 계정 설정 */}
      <Section title="계정">
        <Card className="profile-account">
          <button className="profile-account__item" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>로그아웃</span>
          </button>
        </Card>
      </Section>
    </PageLayout>
  );
}

export default ProfilePage;
