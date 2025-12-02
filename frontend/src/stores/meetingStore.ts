import { create } from 'zustand';
import type { Transcript, Question } from '../types/meeting';

interface MeetingStore {
  transcripts: Transcript[];
  questions: Question[];
  isRecording: boolean;

  addTranscript: (transcript: Transcript) => void;
  addQuestion: (question: Question) => void;
  updateQuestionAction: (questionId: string, action: 'used' | 'ignored' | 'dismissed') => void;
  setRecording: (isRecording: boolean) => void;
  reset: () => void;
}

export const useMeetingStore = create<MeetingStore>((set) => ({
  transcripts: [],
  questions: [],
  isRecording: false,

  addTranscript: (transcript) =>
    set((state) => ({
      transcripts: [...state.transcripts, transcript]
    })),

  addQuestion: (question) =>
    set((state) => ({
      questions: [...state.questions, question]
    })),

  updateQuestionAction: (questionId, action) =>
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === questionId ? { ...q, action } : q
      )
    })),

  setRecording: (isRecording) => set({ isRecording }),

  reset: () => set({ transcripts: [], questions: [], isRecording: false })
}));
