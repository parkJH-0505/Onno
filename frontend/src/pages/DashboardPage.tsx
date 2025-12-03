import { useAuthStore } from '../stores/authStore';
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
    <div className="dashboard-page">
      {/* 헤더 섹션 */}
      <header className="dashboard-page__header">
        <div className="dashboard-page__greeting">
          <h1>{getGreeting()}, {userName}님!</h1>
          <p>오늘도 의미 있는 대화를 시작해보세요</p>
        </div>
        <button className="dashboard-page__start-btn" onClick={onStartMeeting}>
          🎙️ 새 회의
        </button>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="dashboard-page__content">
        {/* 레벨 요약 카드 */}
        <section className="dashboard-page__section">
          <LevelSummaryCard onViewDetails={onViewProgress} />
        </section>

        {/* 최근 관계 */}
        <section className="dashboard-page__section">
          <RecentRelationships
            onSelectRelationship={onSelectRelationship}
            onViewAll={onViewAllRelationships}
          />
        </section>

        {/* 최근 회의 */}
        <section className="dashboard-page__section">
          <RecentMeetings
            onSelectMeeting={onSelectMeeting}
            onViewAll={onViewAllMeetings}
            onNewMeeting={onStartMeeting}
          />
        </section>

        {/* 퀵 액션 */}
        <section className="dashboard-page__quick-actions">
          <button
            className="dashboard-page__quick-action"
            onClick={onViewAllRelationships}
          >
            <span className="dashboard-page__quick-action-icon">👥</span>
            <span className="dashboard-page__quick-action-label">관계 관리</span>
          </button>
          <button
            className="dashboard-page__quick-action"
            onClick={onViewAllMeetings}
          >
            <span className="dashboard-page__quick-action-icon">📋</span>
            <span className="dashboard-page__quick-action-label">회의 기록</span>
          </button>
          <button
            className="dashboard-page__quick-action"
            onClick={onViewProgress}
          >
            <span className="dashboard-page__quick-action-icon">📈</span>
            <span className="dashboard-page__quick-action-label">성장 현황</span>
          </button>
        </section>
      </main>
    </div>
  );
}
