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

// ============ Relationship Object API ============
// Onno의 핵심 차별점 - 스타트업/고객/파트너별 카드 관리

export type RelationshipType = 'STARTUP' | 'CLIENT' | 'PARTNER' | 'OTHER';
export type Industry = 'B2B_SAAS' | 'B2C_APP' | 'ECOMMERCE' | 'FINTECH' | 'HEALTHTECH' | 'EDTECH' | 'PROPTECH' | 'LOGISTICS' | 'AI_ML' | 'BIOTECH' | 'OTHER';
export type FundingStage = 'PRE_SEED' | 'SEED' | 'SERIES_A' | 'SERIES_B' | 'SERIES_C_PLUS' | 'GROWTH' | 'IPO' | 'OTHER';
export type RelationshipStatus = 'ACTIVE' | 'ON_HOLD' | 'PASSED' | 'INVESTED' | 'ARCHIVED';
export type MeetingType = 'INVESTMENT_1ST' | 'INVESTMENT_2ND' | 'IR' | 'DUE_DILIGENCE' | 'MENTORING' | 'GENERAL';

export interface RelationshipObject {
  id: string;
  userId: string;
  name: string;
  type: RelationshipType;
  industry?: Industry;
  stage?: FundingStage;
  status: RelationshipStatus;
  structuredData?: Record<string, unknown>;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    meetings: number;
  };
  meetings?: Array<{
    id: string;
    title: string | null;
    meetingNumber: number;
    meetingType: MeetingType;
    startedAt: string;
    endedAt: string | null;
    status: string;
    duration: number | null;
    summary: string | null;
    _count?: {
      transcripts: number;
      questions: number;
    };
  }>;
}

export interface CreateRelationshipInput {
  userId: string;
  name: string;
  type?: RelationshipType;
  industry?: Industry;
  stage?: FundingStage;
  notes?: string;
  tags?: string[];
}

export interface UpdateRelationshipInput {
  name?: string;
  type?: RelationshipType;
  industry?: Industry;
  stage?: FundingStage;
  status?: RelationshipStatus;
  notes?: string;
  tags?: string[];
}

export const relationshipApi = {
  // 관계 목록 조회
  getAll: (params: {
    userId: string;
    type?: RelationshipType;
    status?: RelationshipStatus;
    industry?: Industry;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    return fetchApi<RelationshipObject[]>(`/api/relationships?${searchParams}`);
  },

  // 관계 생성
  create: (data: CreateRelationshipInput) =>
    fetchApi<RelationshipObject>('/api/relationships', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 관계 상세 조회
  getById: (id: string) =>
    fetchApi<RelationshipObject>(`/api/relationships/${id}`),

  // 관계 수정
  update: (id: string, data: UpdateRelationshipInput) =>
    fetchApi<RelationshipObject>(`/api/relationships/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // 관계의 구조화 데이터 업데이트
  updateData: (id: string, structuredData: Record<string, unknown>, meetingId?: string) =>
    fetchApi<RelationshipObject>(`/api/relationships/${id}/data`, {
      method: 'PATCH',
      body: JSON.stringify({ structuredData, meetingId }),
    }),

  // 관계 삭제 (소프트)
  delete: (id: string, permanent = false) =>
    fetchApi<void>(`/api/relationships/${id}?permanent=${permanent}`, {
      method: 'DELETE',
    }),

  // 관계의 회의 목록
  getMeetings: (id: string, limit = 20, offset = 0) =>
    fetchApi<Meeting[]>(`/api/relationships/${id}/meetings?limit=${limit}&offset=${offset}`),

  // 관계의 맥락 조회 (회의 시작 시 사용)
  getContext: (id: string) =>
    fetchApi<RelationshipContext>(`/api/relationships/${id}/context`),
};

// 관계 맥락 타입 정의
export interface RelationshipContext {
  relationship: {
    id: string;
    name: string;
    type: RelationshipType;
    industry?: Industry;
    stage?: FundingStage;
    status: RelationshipStatus;
    notes?: string;
    tags: string[];
  };
  structuredData: Record<string, unknown>;
  recentMeetings: Array<{
    meetingNumber: number;
    date: string;
    duration: number | null;
    summary: string | null;
    keyQuestions: string[];
  }>;
  totalMeetings: number;
  nextMeetingNumber: number;
}

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
  end: (id: string, options?: { summary?: string; keyQuestions?: string[] }) =>
    fetchApi<Meeting>(`/api/meetings/${id}/end`, {
      method: 'POST',
      body: JSON.stringify(options || {}),
    }),

  // 회의 삭제
  delete: (id: string) =>
    fetchApi<void>(`/api/meetings/${id}`, {
      method: 'DELETE',
    }),
};

export type { Meeting, MeetingDetail };
