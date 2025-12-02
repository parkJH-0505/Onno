import { useMeetingStore } from '../stores/meetingStore';
import type { TranscriptSegment } from '../types/meeting';

// 화자별 색상
const SPEAKER_COLORS: Record<string, string> = {
  '화자1': '#4CAF50',
  '화자2': '#2196F3',
  '화자3': '#FF9800',
  '화자4': '#9C27B0',
  '화자5': '#00BCD4',
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

function getSpeakerColor(speaker: string): string {
  return SPEAKER_COLORS[speaker] || '#666666';
}

interface SegmentItemProps {
  segment: TranscriptSegment;
}

function SegmentItem({ segment }: SegmentItemProps) {
  const color = getSpeakerColor(segment.speaker);
  const roleLabel = segment.speakerRole ? ROLE_LABELS[segment.speakerRole] : '';

  return (
    <div className="segment-item" style={{ borderLeftColor: color }}>
      <div className="segment-header">
        <span className="segment-speaker" style={{ color }}>
          {segment.speaker}
          {roleLabel && <span className="segment-role">({roleLabel})</span>}
        </span>
        <span className="segment-time">{formatTime(segment.startTime)}</span>
      </div>
      <p className="segment-text">{segment.text}</p>
    </div>
  );
}

export function TranscriptPanel() {
  const { transcripts } = useMeetingStore();

  // 모든 segments를 하나의 리스트로 병합하거나, segments가 없으면 기존 방식 사용
  const hasSegments = transcripts.some(t => t.segments && t.segments.length > 0);

  return (
    <div className="transcript-panel">
      <h3>대화 내용</h3>
      <div className="transcript-list">
        {transcripts.length === 0 && (
          <p className="empty-state">대화가 전사되면 여기에 표시됩니다.</p>
        )}

        {hasSegments ? (
          // 화자 분리가 있는 경우: segments 표시
          transcripts.map((t) => (
            <div key={t.id} className="transcript-block">
              {t.segments && t.segments.length > 0 ? (
                t.segments.map((segment, idx) => (
                  <SegmentItem key={`${t.id}-${idx}`} segment={segment} />
                ))
              ) : (
                <div className="transcript-item">
                  <p className="transcript-text">{t.text}</p>
                  <span className="transcript-time">
                    {new Date(t.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              )}
              {t.provider && (
                <span className="transcript-provider">via {t.provider}</span>
              )}
            </div>
          ))
        ) : (
          // 화자 분리가 없는 경우: 기존 방식
          transcripts.map((t) => (
            <div key={t.id} className="transcript-item">
              <p className="transcript-text">{t.text}</p>
              <div className="transcript-meta">
                <span className="transcript-time">
                  {new Date(t.timestamp).toLocaleTimeString()}
                </span>
                {t.latency && (
                  <span className="transcript-latency">
                    {t.latency.toFixed(1)}s
                  </span>
                )}
                {t.provider && (
                  <span className="transcript-provider">{t.provider}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
