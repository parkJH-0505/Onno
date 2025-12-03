import { useState, useEffect } from 'react';
import { MeetingRoom } from './components/MeetingRoom';
import { MeetingDetail } from './components/MeetingDetail';
import { MeetingHistory } from './components/MeetingHistory';
import { AuthPage } from './pages/AuthPage';
import { RelationshipListPage } from './pages/RelationshipListPage';
import { RelationshipDetailPage } from './pages/RelationshipDetailPage';
import { RelationshipFormModal } from './components/RelationshipFormModal';
import { ToastContainer } from './components/ui/ToastContainer';
import { useAuthStore } from './stores/authStore';
import type { RelationshipObject } from './services/api';
import './App.css';

type View = 'auth' | 'history' | 'meeting' | 'detail' | 'relationships' | 'relationship-detail';

function App() {
  const { token, checkAuth } = useAuthStore();
  const [view, setView] = useState<View>('relationships'); // 관계 목록이 메인 화면
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [selectedRelationshipId, setSelectedRelationshipId] = useState<string | null>(null);
  const [selectedRelationshipName, setSelectedRelationshipName] = useState<string | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [showRelationshipModal, setShowRelationshipModal] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState<RelationshipObject | null>(null);

  // 앱 시작 시 인증 상태 확인
  useEffect(() => {
    const init = async () => {
      if (token) {
        await checkAuth();
      }
      setIsAuthChecked(true);
    };
    init();
  }, []);

  // 기존 회의 클릭 → 상세보기 (읽기 전용)
  const handleSelectMeeting = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setView('detail');
  };

  // 새 회의 시작
  const handleNewMeeting = () => {
    setSelectedMeetingId(null);
    setView('meeting');
  };

  const handleBackToHistory = () => {
    setView('history');
    setSelectedMeetingId(null);
  };

  const handleGoToAuth = () => {
    setView('auth');
  };

  // 관계 관련 핸들러
  const handleSelectRelationship = (relationshipId: string) => {
    setSelectedRelationshipId(relationshipId);
    setView('relationship-detail');
  };

  const handleBackToRelationships = () => {
    setView('relationships');
    setSelectedRelationshipId(null);
    setSelectedRelationshipName(null);
  };

  // 회의 종료 후 관계 상세 페이지로 돌아가기
  const handleMeetingEnd = () => {
    if (selectedRelationshipId) {
      // 관계에서 시작한 회의 → 해당 관계 상세 페이지로 돌아가기 (새로고침 트리거)
      const relationshipId = selectedRelationshipId;
      setSelectedRelationshipId(null);
      setSelectedRelationshipName(null);
      setTimeout(() => {
        setSelectedRelationshipId(relationshipId);
        setView('relationship-detail');
      }, 0);
    } else {
      // 일반 회의 → 회의 히스토리로
      handleBackToHistory();
    }
  };

  // 관계에서 회의 시작
  const handleStartMeetingWithRelationship = (relationshipId: string, relationshipName?: string) => {
    setSelectedRelationshipId(relationshipId);
    setSelectedRelationshipName(relationshipName || null);
    setView('meeting');
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
    // 페이지 새로고침 트리거 (간단한 방식)
    if (view === 'relationships') {
      setView('auth');
      setTimeout(() => setView('relationships'), 0);
    } else if (view === 'relationship-detail' && selectedRelationshipId) {
      const id = selectedRelationshipId;
      setSelectedRelationshipId(null);
      setTimeout(() => setSelectedRelationshipId(id), 0);
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

  return (
    <>
      {view === 'auth' && (
        <AuthPage
          onSuccess={() => setView('meeting')}
          onSkip={() => setView('meeting')}
        />
      )}
      {view === 'history' && (
        <MeetingHistory
          onSelectMeeting={handleSelectMeeting}
          onNewMeeting={handleNewMeeting}
          onGoToRelationships={handleBackToRelationships}
        />
      )}
      {view === 'meeting' && (
        <MeetingRoom
          onBack={handleMeetingEnd}
          onGoToAuth={handleGoToAuth}
          relationshipId={selectedRelationshipId || undefined}
          relationshipName={selectedRelationshipName || undefined}
        />
      )}
      {view === 'detail' && selectedMeetingId && (
        <MeetingDetail
          meetingId={selectedMeetingId}
          onBack={handleBackToHistory}
        />
      )}
      {view === 'relationships' && (
        <RelationshipListPage
          onSelectRelationship={handleSelectRelationship}
          onCreateRelationship={handleCreateRelationship}
          onStartMeeting={handleStartMeetingWithRelationship}
          onGoToHistory={() => setView('history')}
        />
      )}
      {view === 'relationship-detail' && selectedRelationshipId && (
        <RelationshipDetailPage
          relationshipId={selectedRelationshipId}
          onBack={handleBackToRelationships}
          onStartMeeting={handleStartMeetingWithRelationship}
          onEdit={handleEditRelationship}
        />
      )}
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
