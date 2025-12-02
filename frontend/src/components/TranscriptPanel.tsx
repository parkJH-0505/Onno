import { useMeetingStore } from '../stores/meetingStore';

export function TranscriptPanel() {
  const { transcripts } = useMeetingStore();

  return (
    <div className="transcript-panel">
      <h3>📝 대화 내용</h3>
      <div className="transcript-list">
        {transcripts.length === 0 && (
          <p className="empty-state">대화가 전사되면 여기에 표시됩니다.</p>
        )}
        {transcripts.map((t) => (
          <div key={t.id} className="transcript-item">
            <p className="transcript-text">{t.text}</p>
            <span className="transcript-time">
              {new Date(t.timestamp).toLocaleTimeString()}
              {t.latency && ` (${t.latency.toFixed(2)}s)`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
