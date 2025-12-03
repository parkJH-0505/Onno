import { useState, useEffect } from 'react';
import { MeetingRoom } from './components/MeetingRoom';
import { MeetingDetail } from './components/MeetingDetail';
import { MeetingHistory } from './components/MeetingHistory';
import { AuthPage } from './pages/AuthPage';
import { ToastContainer } from './components/ui/ToastContainer';
import { useAuthStore } from './stores/authStore';
import './App.css';

type View = 'auth' | 'history' | 'meeting' | 'detail';

function App() {
  const { token, checkAuth } = useAuthStore();
  const [view, setView] = useState<View>('meeting'); // 프로토타입에서는 바로 회의 시작
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

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
        />
      )}
      {view === 'meeting' && (
        <MeetingRoom
          onBack={handleBackToHistory}
          onGoToAuth={handleGoToAuth}
        />
      )}
      {view === 'detail' && selectedMeetingId && (
        <MeetingDetail
          meetingId={selectedMeetingId}
          onBack={handleBackToHistory}
        />
      )}
      <ToastContainer />
    </>
  );
}

export default App;
