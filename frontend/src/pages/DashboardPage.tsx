import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { PageLayout, PageHeader, Section } from '../components/layout';
import { Button } from '../components/design-system';
import { LevelSummaryCard } from '../components/dashboard/LevelSummaryCard';
import { RecentRelationships } from '../components/dashboard/RecentRelationships';
import { RecentMeetings } from '../components/dashboard/RecentMeetings';
import { relationshipApi, meetingApi, type RelationshipObject } from '../services/api';
import './DashboardPage.css';

interface DashboardPageProps {
  onSelectRelationship: (id: string) => void;
  onSelectMeeting: (id: string) => void;
  onViewAllRelationships: () => void;
  onViewAllMeetings: () => void;
  onStartMeeting: (relationshipId?: string, relationshipName?: string) => void;
  onViewProgress: () => void;
  onOpenSearch?: () => void;
}

// 오늘 날짜 체크
const isToday = (dateStr: string) => {
  const today = new Date();
  const date = new Date(dateStr);
  return today.toDateString() === date.toDateString();
};

export function DashboardPage({
  onSelectRelationship,
  onSelectMeeting,
  onViewAllRelationships,
  onViewAllMeetings,
  onStartMeeting,
  onViewProgress,
  onOpenSearch,
}: DashboardPageProps) {
  const { user } = useAuthStore();
  const [priorityMeeting, setPriorityMeeting] = useState<{
    relationship: RelationshipObject;
    time?: string;
    isUrgent: boolean;
  } | null>(null);
  const [todayStats, setTodayStats] = useState({ meetings: 0, relationships: 0 });
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // 우선순위 데이터 로드
  useEffect(() => {
    if (!user?.id) return;

    const loadPriorityData = async () => {
      try {
        // 최근 활성 관계 중 가장 최근 것
        const relationships = await relationshipApi.getAll({ userId: user.id }) || [];
        const activeRelationships = relationships.filter(r => r.status === 'ACTIVE');

        if (activeRelationships.length > 0) {
          // 가장 최근에 회의한 관계
          const withMeetings = activeRelationships.filter(r => (r._count?.meetings ?? 0) > 0);
          if (withMeetings.length > 0) {
            const sorted = withMeetings.sort((a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
            const firstSorted = sorted[0];
            if (firstSorted) {
              setPriorityMeeting({
                relationship: firstSorted,
                time: '14:00',
                isUrgent: true,
              });
            }
          }
        }

        // 오늘의 통계
        const meetings = await meetingApi.getAll() || [];
        const todayMeetings = meetings.filter(m => isToday(m.startedAt));

        setTodayStats({
          meetings: todayMeetings.length,
          relationships: activeRelationships.length,
        });
      } catch (err) {
        console.error('Failed to load priority data:', err);
      }
    };

    loadPriorityData();
  }, [user?.id]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침이에요';
    if (hour < 18) return '좋은 오후에요';
    return '좋은 저녁이에요';
  };

  const userName = user?.name || '사용자';

  const handleDismissBanner = () => {
    setBannerDismissed(true);
  };

  return (
    <PageLayout
      header={
        <PageHeader
          title={`${getGreeting()}, ${userName}님`}
          subtitle="오늘도 의미 있는 대화를 시작해보세요"
          actions={
            <Button variant="primary" onClick={() => onStartMeeting()}>
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
      {/* Priority Banner */}
      {priorityMeeting && !bannerDismissed && (
        <div className="priority-banner">
          <div className="priority-banner__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="priority-banner__content">
            <span className="priority-banner__title">
              {priorityMeeting.relationship.name} 미팅
            </span>
            <span className="priority-banner__time">
              {priorityMeeting.time && `오늘 ${priorityMeeting.time}`}
              {priorityMeeting.isUrgent && (
                <span className="priority-banner__urgent">곧 시작</span>
              )}
            </span>
          </div>
          <div className="priority-banner__actions">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onStartMeeting(priorityMeeting.relationship.id, priorityMeeting.relationship.name)}
            >
              시작하기
            </Button>
            <button className="priority-banner__dismiss" onClick={handleDismissBanner}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <Section>
        <div className="quick-stats">
          <div className="quick-stat">
            <span className="quick-stat__value">{todayStats.meetings}</span>
            <span className="quick-stat__label">오늘 회의</span>
          </div>
          <div className="quick-stat">
            <span className="quick-stat__value">{todayStats.relationships}</span>
            <span className="quick-stat__label">활성 관계</span>
          </div>
          <div className="quick-stat quick-stat--highlight">
            <span className="quick-stat__value">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </span>
            <span className="quick-stat__label">성장 중</span>
          </div>
        </div>
      </Section>

      {/* Quick Actions */}
      <Section>
        <div className="quick-actions">
          <button className="quick-action-btn" onClick={() => onStartMeeting()}>
            <div className="quick-action-btn__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
            <span className="quick-action-btn__label">새 미팅</span>
          </button>

          <button className="quick-action-btn" onClick={onViewAllRelationships}>
            <div className="quick-action-btn__icon quick-action-btn__icon--green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            </div>
            <span className="quick-action-btn__label">새 관계</span>
          </button>

          <button className="quick-action-btn" onClick={onOpenSearch}>
            <div className="quick-action-btn__icon quick-action-btn__icon--purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <span className="quick-action-btn__label">검색</span>
            <span className="quick-action-btn__shortcut">⌘K</span>
          </button>

          <button className="quick-action-btn" onClick={onViewAllMeetings}>
            <div className="quick-action-btn__icon quick-action-btn__icon--amber">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <span className="quick-action-btn__label">기록</span>
          </button>
        </div>
      </Section>

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
          onNewMeeting={() => onStartMeeting()}
        />
      </Section>
    </PageLayout>
  );
}