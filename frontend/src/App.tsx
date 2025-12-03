import { useState } from 'react';
import { MeetingRoom } from './components/MeetingRoom';
import { MeetingDetail } from './components/MeetingDetail';
import { MeetingHistory } from './components/MeetingHistory';
import { ToastContainer } from './components/ui/ToastContainer';
import './App.css';

type View = 'history' | 'meeting' | 'detail';

function App() {
  const [view, setView] = useState<View>('meeting'); // 프로토타입에서는 바로 회의 시작
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

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

  return (
    <>
      {view === 'history' && (
        <MeetingHistory
          onSelectMeeting={handleSelectMeeting}
          onNewMeeting={handleNewMeeting}
        />
      )}
      {view === 'meeting' && (
        <MeetingRoom onBack={handleBackToHistory} />
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
