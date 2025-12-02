export interface TranscriptSegment {
  speaker: string;
  text: string;
  startTime: number;
  speakerRole?: 'investor' | 'founder' | 'unknown';
}

export interface Transcript {
  id: string;
  text: string;
  formattedText?: string;
  segments?: TranscriptSegment[];
  timestamp: string;
  latency?: number;
  provider?: string;
}

export interface Question {
  id: string;
  text: string;
  priority: 'critical' | 'important' | 'follow_up';
  reason: string;
  category: string;
  timestamp: string;
  action?: 'used' | 'ignored' | 'dismissed';
}

export interface MeetingState {
  transcripts: Transcript[];
  questions: Question[];
  isRecording: boolean;
}
