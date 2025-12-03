const API_URL = import.meta.env.VITE_API_URL || 'https://onno-backend.onrender.com';

interface Meeting {
  id: string;
  title: string | null;
  startedAt: string;
  endedAt: string | null;
  status: 'ACTIVE' | 'ENDED' | 'PROCESSING' | 'COMPLETED';
  duration: number | null;
  summary: string | null;
  _count?: {
    transcripts: number;
    questions: number;
  };
}

interface MeetingDetail extends Meeting {
  transcripts: Array<{
    id: string;
    text: string;
    speaker: string | null;
    speakerRole: string | null;
    startTime: number | null;
    createdAt: string;
  }>;
  questions: Array<{
    id: string;
    text: string;
    category: string | null;
    priority: number;
    isUsed: boolean;
    createdAt: string;
  }>;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const result: ApiResponse<T> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'API 요청 실패');
  }

  return result.data as T;
}

// ============ User & Preferences API ============

interface UserPreferences {
  id: string;
  userId: string;
  businessModelPref: number;
  tractionPref: number;
  teamPref: number;
  marketPref: number;
  technologyPref: number;
  financialsPref: number;
  risksPref: number;
  tone: 'FORMAL' | 'CASUAL' | 'DIRECT';
  includeExplanation: boolean;
  totalQuestionsSeen: number;
  totalQuestionsUsed: number;
}

interface QuestionAction {
  questionId?: string;
  originalText: string;
  category?: string;
  action: 'USED' | 'USED_MODIFIED' | 'IGNORED' | 'DISMISSED';
  modifiedText?: string;
  meetingId?: string;
}

interface UserStats {
  preferences: UserPreferences;
  totalSeen: number;
  totalUsed: number;
  usageRate: number;
  actionBreakdown: Array<{ action: string; _count: { action: number } }>;
  favoriteCategories: Array<{ category: string; _count: { category: number } }>;
}

export const userApi = {
  // 사용자 생성 또는 조회
  getOrCreate: (identifier: string) =>
    fetchApi<{ id: string; email: string; name: string | null }>('/api/users', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    }),

  // 사용자 선호도 조회
  getPreferences: (userId: string) =>
    fetchApi<UserPreferences>(`/api/users/${userId}/preferences`),

  // 사용자 선호도 업데이트
  updatePreferences: (userId: string, prefs: Partial<UserPreferences>) =>
    fetchApi<UserPreferences>(`/api/users/${userId}/preferences`, {
      method: 'PATCH',
      body: JSON.stringify(prefs),
    }),

  // 질문 액션 로깅 (사용/무시/거부)
  logQuestionAction: (userId: string, action: QuestionAction) =>
    fetchApi<{ id: string }>(`/api/users/${userId}/question-actions`, {
      method: 'POST',
      body: JSON.stringify(action),
    }),

  // 사용자 통계 조회
  getStats: (userId: string) =>
    fetchApi<UserStats>(`/api/users/${userId}/stats`),
};

// ============ Meeting API ============

export const meetingApi = {
  // 회의 목록 조회
  getAll: () => fetchApi<Meeting[]>('/api/meetings'),

  // 회의 상세 조회
  getById: (id: string) => fetchApi<MeetingDetail>(`/api/meetings/${id}`),

  // 회의 생성
  create: (title: string) =>
    fetchApi<Meeting>('/api/meetings', {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),

  // 회의 종료
  end: (id: string) =>
    fetchApi<Meeting>(`/api/meetings/${id}/end`, {
      method: 'POST',
    }),

  // 회의 삭제
  delete: (id: string) =>
    fetchApi<void>(`/api/meetings/${id}`, {
      method: 'DELETE',
    }),
};

export type { Meeting, MeetingDetail };
