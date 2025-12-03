import { useState } from 'react';
import { MeetingRoom } from './components/MeetingRoom';
import { MeetingHistory } from './components/MeetingHistory';
import { ToastContainer } from './components/ui/ToastContainer';
import './App.css';

type View = 'history' | 'meeting';

function App() {
  const [view, setView] = useState<View>('meeting'); // 프로토타입에서는 바로 회의 시작
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

  const handleSelectMeeting = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setView('meeting');
  };

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
      {view === 'history' ? (
        <MeetingHistory
          onSelectMeeting={handleSelectMeeting}
          onNewMeeting={handleNewMeeting}
        />
      ) : (
        <MeetingRoom
          meetingId={selectedMeetingId}
          onBack={handleBackToHistory}
        />
      )}
      <ToastContainer />
    </>
  );
}

export default App;
