export interface TranscriptionData {
  meetingId: string;
  audioData: ArrayBuffer;
}

export interface QuestionData {
  transcript: string;
}

export interface MeetingEvent {
  meetingId: string;
  userId: string;
  timestamp: string;
}
