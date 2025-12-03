import { useState, useEffect } from 'react';
import { MeetingRoom } from './components/MeetingRoom';
import { MeetingDetail } from './components/MeetingDetail';
import { MeetingHistory } from './components/MeetingHistory';
import { RelationshipListPage } from './pages/RelationshipListPage';
import { RelationshipDetailPage } from './pages/RelationshipDetailPage';
import { DashboardPage } from './pages/DashboardPage';
import { RelationshipFormModal } from './components/RelationshipFormModal';
import { BottomNavigation } from './components/BottomNavigation';
import { ToastContainer } from './components/ui/ToastContainer';
import { useAuthStore } from './stores/authStore';
import { useNavigationStore } from './stores/navigationStore';
import type { RelationshipObject } from './services/api';
import './App.css';

function App() {
  const { token, checkAuth, loginAsGuest, user } = useAuthStore();
  const {
    activeTab,
    setActiveTab,
    isNavigationVisible,
    setNavigationVisible,
    subView,
    clearSubView,
    meetingContext,
    startMeetingWithRelationship,
    clearMeetingContext,
  } = useNavigationStore();

  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [showRelationshipModal, setShowRelationshipModal] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState<RelationshipObject | null>(null);

  // 회의 모드 (MeetingRoom 표시 여부)
  const [isMeetingMode, setIsMeetingMode] = useState(false);

  // 앱 시작 시 인증 상태 확인 및 자동 게스트 로그인
  useEffect(() => {
    const init = async () => {
      if (token) {
        const isValid = await checkAuth();
        if (!isValid) {
          await loginAsGuest();
        }
      } else {
        await loginAsGuest();
      }
      setIsAuthChecked(true);
    };
    init();
  }, []);

  // 디버그: 현재 사용자 정보 로깅
  useEffect(() => {
    if (user) {
      console.log('Current user:', user.id, user.email);
    }
  }, [user]);

  // 회의 시작
  const handleStartMeeting = (relationshipId?: string, relationshipName?: string) => {
    if (relationshipId) {
      startMeetingWithRelationship(relationshipId, relationshipName);
    }
    setIsMeetingMode(true);
    setNavigationVisible(false);
  };

  // 회의 종료
  const handleMeetingEnd = () => {
    setIsMeetingMode(false);
    setNavigationVisible(true);

    // 관계에서 시작한 회의면 해당 관계 상세로 돌아가기
    if (meetingContext.relationshipId) {
      setActiveTab('relationships');
      // subView는 유지 - 관계 상세 페이지가 refresh 되도록
    }
    clearMeetingContext();
  };

  // 관계 상세에서 뒤로가기
  const handleBackFromRelationshipDetail = () => {
    clearSubView('relationships');
  };

  // 회의 상세에서 뒤로가기
  const handleBackFromMeetingDetail = () => {
    clearSubView('meetings');
  };

  // 관계 선택 (목록에서)
  const handleSelectRelationship = (relationshipId: string) => {
    useNavigationStore.getState().goToRelationshipDetail(relationshipId);
  };

  // 회의 선택 (목록에서)
  const handleSelectMeeting = (meetingId: string) => {
    useNavigationStore.getState().goToMeetingDetail(meetingId);
  };

  // 관계 생성/편집 모달
  const handleCreateRelationship = () => {
    setEditingRelationship(null);
    setShowRelationshipModal(true);
  };

  const handleEditRelationship = (relationship: RelationshipObject) => {
    setEditingRelationship(relationship);
    setShowRelationshipModal(true);
  };

  const handleCloseRelationshipModal = () => {
    setShowRelationshipModal(false);
    setEditingRelationship(null);
  };

  const handleSaveRelationship = () => {
    setShowRelationshipModal(false);
    setEditingRelationship(null);
    // 새로고침 트리거
    if (activeTab === 'relationships') {
      const currentDetailId = subView.relationships.detailId;
      clearSubView('relationships');
      if (currentDetailId) {
        setTimeout(() => {
          useNavigationStore.getState().goToRelationshipDetail(currentDetailId);
        }, 0);
      }
    }
  };

  // 인증 체크 완료 전에는 로딩 표시
  if (!isAuthChecked) {
    return (
      <div className="app-loading">
        <div className="app-loading__spinner" />
        <p>로딩 중...</p>
      </div>
    );
  }

  // 회의 모드일 때는 MeetingRoom만 표시
  if (isMeetingMode) {
    return (
      <>
        <MeetingRoom
          onBack={handleMeetingEnd}
          onGoToAuth={() => setIsMeetingMode(false)}
          relationshipId={meetingContext.relationshipId || undefined}
          relationshipName={meetingContext.relationshipName || undefined}
        />
        <ToastContainer />
      </>
    );
  }

  // 탭별 콘텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <DashboardPage
            onSelectRelationship={handleSelectRelationship}
            onSelectMeeting={handleSelectMeeting}
            onViewAllRelationships={() => setActiveTab('relationships')}
            onViewAllMeetings={() => setActiveTab('meetings')}
            onStartMeeting={() => handleStartMeeting()}
            onViewProgress={() => setActiveTab('profile')}
          />
        );

      case 'relationships':
        // 관계 상세 페이지 표시
        if (subView.relationships.detailId) {
          return (
            <RelationshipDetailPage
              relationshipId={subView.relationships.detailId}
              onBack={handleBackFromRelationshipDetail}
              onStartMeeting={handleStartMeeting}
              onEdit={handleEditRelationship}
            />
          );
        }
        // 관계 목록 페이지
        return (
          <RelationshipListPage
            onSelectRelationship={handleSelectRelationship}
            onCreateRelationship={handleCreateRelationship}
            onStartMeeting={handleStartMeeting}
            onGoToHistory={() => setActiveTab('meetings')}
          />
        );

      case 'meetings':
        // 회의 상세 페이지 표시
        if (subView.meetings.detailId) {
          return (
            <MeetingDetail
              meetingId={subView.meetings.detailId}
              onBack={handleBackFromMeetingDetail}
            />
          );
        }
        // 회의 목록 페이지
        return (
          <MeetingHistory
            onSelectMeeting={handleSelectMeeting}
            onNewMeeting={() => handleStartMeeting()}
            onGoToRelationships={() => setActiveTab('relationships')}
          />
        );

      case 'profile':
        // Phase 4-3에서 ProfilePage로 교체 예정
        return (
          <div className="profile-placeholder">
            <div className="profile-placeholder__header">
              <h1>👤 내 프로필</h1>
              <p>준비 중입니다.</p>
            </div>
            <div className="profile-placeholder__info">
              <p><strong>이메일:</strong> {user?.email || 'guest@onno.ai'}</p>
              <p><strong>이름:</strong> {user?.name || '게스트'}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className={isNavigationVisible ? 'app-with-navigation' : ''}>
        {renderTabContent()}
      </div>

      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        visible={isNavigationVisible}
      />

      {showRelationshipModal && (
        <RelationshipFormModal
          relationship={editingRelationship}
          onClose={handleCloseRelationshipModal}
          onSave={handleSaveRelationship}
        />
      )}

      <ToastContainer />
    </>
  );
}

export default App;
