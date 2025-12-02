export interface Transcript {
  id: string;
  text: string;
  timestamp: string;
  latency?: number;
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
