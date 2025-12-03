import { io, Socket } from 'socket.io-client';
import { useMeetingStore } from '../stores/meetingStore';

class WebSocketService {
  private socket: Socket | null = null;
  private meetingId: string | null = null;

  connect(wsUrl: string) {
    this.socket = io(wsUrl);

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('transcription', (data) => {
      console.log('Transcription received:', data);
      useMeetingStore.getState().addTranscript(data);
    });

    this.socket.on('question_suggested', (data) => {
      console.log('Question suggested:', data);
      useMeetingStore.getState().addQuestion(data);
    });

    this.socket.on('participant_joined', (data) => {
      console.log('Participant joined:', data);
    });

    this.socket.on('participant_left', (data) => {
      console.log('Participant left:', data);
    });

    this.socket.on('error', (data) => {
      console.error('WebSocket error:', data);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
  }

  joinMeeting(meetingId: string, userId: string, options?: {
    title?: string;
    relationshipId?: string;
    meetingType?: string;
  }) {
    this.meetingId = meetingId;
    this.socket?.emit('join_meeting', {
      meetingId,
      userId,
      title: options?.title,
      relationshipId: options?.relationshipId,
      meetingType: options?.meetingType,
    });
  }

  sendAudioChunk(audioData: Blob) {
    if (!this.meetingId) {
      console.error('No meeting joined');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.socket?.emit('audio_chunk', {
        meetingId: this.meetingId,
        audioData: reader.result
      });
    };
    reader.readAsArrayBuffer(audioData);
  }

  leaveMeeting(userId: string, endMeeting: boolean = false) {
    if (!this.meetingId) return;

    this.socket?.emit('leave_meeting', {
      meetingId: this.meetingId,
      userId,
      endMeeting
    });
    this.meetingId = null;
  }

  disconnect() {
    this.socket?.disconnect();
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export default new WebSocketService();
