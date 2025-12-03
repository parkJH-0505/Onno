import { useAuthStore } from '../stores/authStore';
import { PageLayout, PageHeader, Section, Card } from '../components/layout';
import { Button } from '../components/design-system';
import { LevelSummaryCard } from '../components/dashboard/LevelSummaryCard';
import { RecentRelationships } from '../components/dashboard/RecentRelationships';
import { RecentMeetings } from '../components/dashboard/RecentMeetings';
import './DashboardPage.css';

interface DashboardPageProps {
  onSelectRelationship: (id: string) => void;
  onSelectMeeting: (id: string) => void;
  onViewAllRelationships: () => void;
  onViewAllMeetings: () => void;
  onStartMeeting: () => void;
  onViewProgress: () => void;
}

export function DashboardPage({
  onSelectRelationship,
  onSelectMeeting,
  onViewAllRelationships,
  onViewAllMeetings,
  onStartMeeting,
  onViewProgress,
}: DashboardPageProps) {
  const { user } = useAuthStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침이에요';
    if (hour < 18) return '좋은 오후에요';
    return '좋은 저녁이에요';
  };

  const userName = user?.name || '사용자';

  return (
    <PageLayout
      header={
        <PageHeader
          title={`${getGreeting()}, ${userName}님`}
          subtitle="오늘도 의미 있는 대화를 시작해보세요"
          actions={
            <Button variant="primary" onClick={onStartMeeting}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
              새 회의
            </Button>
          }
        />
      }
    >
      {/* 레벨 요약 */}
      <Section>
        <LevelSummaryCard onViewDetails={onViewProgress} />
      </Section>

      {/* 최근 관계 */}
      <Section
        title="최근 관계"
        action={
          <button className="section-link" onClick={onViewAllRelationships}>
            전체보기
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        }
      >
        <RecentRelationships
          onSelectRelationship={onSelectRelationship}
          onViewAll={onViewAllRelationships}
        />
      </Section>

      {/* 최근 회의 */}
      <Section
        title="최근 회의"
        action={
          <button className="section-link" onClick={onViewAllMeetings}>
            전체보기
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        }
      >
        <RecentMeetings
          onSelectMeeting={onSelectMeeting}
          onNewMeeting={onStartMeeting}
        />
      </Section>

      {/* 퀵 액션 */}
      <Section>
        <div className="quick-actions">
          <Card hoverable onClick={onViewAllRelationships} className="quick-action-card">
            <div className="quick-action-card__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span className="quick-action-card__label">관계 관리</span>
          </Card>

          <Card hoverable onClick={onViewAllMeetings} className="quick-action-card">
            <div className="quick-action-card__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <span className="quick-action-card__label">회의 기록</span>
          </Card>

          <Card hoverable onClick={onViewProgress} className="quick-action-card">
            <div className="quick-action-card__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <span className="quick-action-card__label">성장 현황</span>
          </Card>
        </div>
      </Section>
    </PageLayout>
  );
}
