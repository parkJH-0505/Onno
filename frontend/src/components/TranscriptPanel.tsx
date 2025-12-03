import { useMeetingStore } from '../stores/meetingStore';
import type { TranscriptSegment } from '../types/meeting';
import './TranscriptPanel.css';

// 화자 색상
const SPEAKER_COLORS = [
  'var(--color-success)',
  'var(--color-primary)',
  'var(--color-insight)',
  '#9C27B0',
  '#00BCD4',
];

// 화자별 색상 맵 생성
const getSpeakerColorMap = (speakers: string[]): Record<string, string> => {
  const colorMap: Record<string, string> = {};
  speakers.forEach((speaker, idx) => {
    colorMap[speaker] = SPEAKER_COLORS[idx % SPEAKER_COLORS.length];
  });
  return colorMap;
};

// 화자 역할 라벨
const ROLE_LABELS: Record<string, string> = {
  investor: '투자자',
  founder: '창업자',
  unknown: '',
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

interface SegmentItemProps {
  segment: TranscriptSegment;
  speakerColor: string;
}

function SegmentItem({ segment, speakerColor }: SegmentItemProps) {
  const roleLabel = segment.speakerRole ? ROLE_LABELS[segment.speakerRole] : '';

  return (
    <div
      className="transcript-segment"
      style={{ '--speaker-color': speakerColor } as React.CSSProperties}
    >
      <div className="transcript-segment__header">
        <span className="transcript-segment__speaker">
          {segment.speaker}
          {roleLabel && <span className="transcript-segment__role">({roleLabel})</span>}
        </span>
        <span className="transcript-segment__time">{formatTime(segment.startTime)}</span>
      </div>
      <p className="transcript-segment__text">{segment.text}</p>
    </div>
  );
}

export function TranscriptPanel() {
  const { transcripts } = useMeetingStore();

  // 모든 화자 수집
  const allSpeakers = [...new Set(
    transcripts.flatMap(t =>
      t.segments?.map(s => s.speaker) || []
    ).filter(Boolean) as string[]
  )];
  const speakerColorMap = getSpeakerColorMap(allSpeakers);

  // segments가 있는지 확인
  const hasSegments = transcripts.some(t => t.segments && t.segments.length > 0);

  return (
    <div className="transcript-panel-v2">
      {transcripts.length === 0 ? (
        <div className="transcript-panel-v2__empty">
          <div className="transcript-panel-v2__empty-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="transcript-panel-v2__empty-text">
            대화가 전사되면 여기에 표시됩니다
          </p>
        </div>
      ) : hasSegments ? (
        <div className="transcript-list">
          {transcripts.map((t) => (
            <div key={t.id} className="transcript-block">
              {t.segments && t.segments.length > 0 ? (
                t.segments.map((segment, idx) => (
                  <SegmentItem
                    key={`${t.id}-${idx}`}
                    segment={segment}
                    speakerColor={speakerColorMap[segment.speaker] || 'var(--color-primary)'}
                  />
                ))
              ) : (
                <div className="transcript-simple">
                  <p className="transcript-simple__text">{t.text}</p>
                  <span className="transcript-simple__time">
                    {new Date(t.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              )}
              {t.provider && (
                <span className="transcript-provider">via {t.provider}</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="transcript-list">
          {transcripts.map((t) => (
            <div key={t.id} className="transcript-simple">
              <p className="transcript-simple__text">{t.text}</p>
              <div className="transcript-simple__meta">
                <span className="transcript-simple__time">
                  {new Date(t.timestamp).toLocaleTimeString()}
                </span>
                {t.latency && (
                  <span className="transcript-simple__latency">
                    {t.latency.toFixed(1)}s
                  </span>
                )}
                {t.provider && (
                  <span className="transcript-simple__provider">{t.provider}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
