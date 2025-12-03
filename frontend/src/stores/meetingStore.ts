import { create } from 'zustand';
import type { Transcript, Question } from '../types/meeting';

// 텍스트 유사도 검사 (간단한 중복 감지)
function isSimilarText(text1: string, text2: string): boolean {
  const t1 = text1.trim().toLowerCase();
  const t2 = text2.trim().toLowerCase();

  // 완전 동일
  if (t1 === t2) return true;

  // 한쪽이 다른 쪽에 포함 (80% 이상)
  if (t1.includes(t2) || t2.includes(t1)) {
    const shorter = t1.length < t2.length ? t1 : t2;
    const longer = t1.length >= t2.length ? t1 : t2;
    if (shorter.length / longer.length > 0.7) return true;
  }

  return false;
}

interface MeetingStore {
  transcripts: Transcript[];
  questions: Question[];
  isRecording: boolean;
  lastTranscriptText: string; // 마지막 전사 텍스트 추적

  addTranscript: (transcript: Transcript) => void;
  addQuestion: (question: Question) => void;
  updateQuestionAction: (questionId: string, action: 'used' | 'ignored' | 'dismissed') => void;
  setRecording: (isRecording: boolean) => void;
  reset: () => void;
}

export const useMeetingStore = create<MeetingStore>((set, get) => ({
  transcripts: [],
  questions: [],
  isRecording: false,
  lastTranscriptText: '',

  addTranscript: (transcript) => {
    const state = get();
    const newText = transcript.text.trim();

    // 빈 텍스트 무시
    if (!newText) return;

    // 마지막 몇 개의 전사와 비교하여 중복 체크
    const recentTranscripts = state.transcripts.slice(-5);
    const isDuplicate = recentTranscripts.some(t => isSimilarText(t.text, newText));

    if (isDuplicate) {
      console.log('Duplicate transcript filtered:', newText.substring(0, 50) + '...');
      return;
    }

    set({
      transcripts: [...state.transcripts, transcript],
      lastTranscriptText: newText
    });
  },

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

  reset: () => set({ transcripts: [], questions: [], isRecording: false, lastTranscriptText: '' })
}));
