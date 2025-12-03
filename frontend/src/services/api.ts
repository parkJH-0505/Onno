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
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
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

// ============ Personalization API (Phase 3) ============

export type DomainType = 'INVESTMENT_SCREENING' | 'MENTORING' | 'SALES' | 'PRODUCT_REVIEW' | 'TEAM_MEETING' | 'USER_INTERVIEW' | 'GENERAL';
export type PersonaType = 'ANALYST' | 'BUDDY' | 'GUARDIAN' | 'VISIONARY';
export type FeedbackRating = 'THUMBS_UP' | 'THUMBS_DOWN';

export interface UserDomainLevel {
  id: string;
  userId: string;
  domain: DomainType;
  level: number;
  experiencePoints: number;
  unlockedFeatures: string[];
  persona: PersonaType;
  createdAt: string;
  updatedAt: string;
}

export interface UserProgress {
  totalXp: number;
  primaryDomain: DomainType;
  primaryLevel: number;
  allDomains: Array<{
    domain: DomainType;
    level: number;
    xp: number;
    persona: PersonaType;
    features: string[];
  }>;
  recentLevelUps: Array<{
    domain: DomainType;
    oldLevel: number;
    newLevel: number;
    xpAtLevelUp: number;
    newFeatures: string[];
    createdAt: string;
  }>;
}

export interface XpInfo {
  currentXp: number;
  nextLevelXp: number | null;
  remaining: number | null;
}

export interface MeetingSummary {
  id: string;
  meetingId: string;
  summary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: string[];
  keyQuestions: string[];
  missedQuestions: string[];
  suggestedDataUpdates?: Record<string, unknown>;
  nextMeetingAgenda: string[];
  generatedAt: string;
}

export const personalizationApi = {
  // 사용자 전체 진행 상황 조회
  getProgress: (userId: string) =>
    fetchApi<UserProgress>(`/api/personalization/users/${userId}/progress`),

  // 특정 도메인 레벨 조회
  getDomainLevel: (userId: string, domain: DomainType) =>
    fetchApi<UserDomainLevel>(`/api/personalization/users/${userId}/domains/${domain}/level`),

  // 모든 도메인 레벨 조회
  getAllDomainLevels: (userId: string) =>
    fetchApi<UserDomainLevel[]>(`/api/personalization/users/${userId}/domains`),

  // 다음 레벨까지 남은 XP
  getXpToNextLevel: (userId: string, domain: DomainType) =>
    fetchApi<XpInfo>(`/api/personalization/users/${userId}/domains/${domain}/next-level`),

  // 페르소나 조회
  getPersona: (userId: string, domain: DomainType) =>
    fetchApi<{ persona: PersonaType }>(`/api/personalization/users/${userId}/domains/${domain}/persona`),

  // 페르소나 설정
  setPersona: (userId: string, domain: DomainType, persona: PersonaType) =>
    fetchApi<UserDomainLevel>(`/api/personalization/users/${userId}/domains/${domain}/persona`, {
      method: 'PUT',
      body: JSON.stringify({ persona }),
    }),

  // 질문 피드백 추가
  addQuestionFeedback: (userId: string, data: {
    questionId: string;
    rating: FeedbackRating;
    tags?: string[];
    comment?: string;
  }) =>
    fetchApi<{ id: string }>(`/api/personalization/users/${userId}/question-feedback`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 해금된 기능 조회
  getFeatures: (userId: string, domain: DomainType) =>
    fetchApi<string[]>(`/api/personalization/users/${userId}/domains/${domain}/features`),

  // 레벨 히스토리
  getLevelHistory: (userId: string, domain?: DomainType) => {
    const url = domain
      ? `/api/personalization/users/${userId}/level-history?domain=${domain}`
      : `/api/personalization/users/${userId}/level-history`;
    return fetchApi<UserProgress['recentLevelUps']>(url);
  },
};

// ============ Summary API (Phase 3) ============

export const summaryApi = {
  // 회의 요약 조회
  get: (meetingId: string) =>
    fetchApi<MeetingSummary>(`/api/meetings/${meetingId}/summary`),

  // 회의 요약 생성 (수동)
  generate: (meetingId: string) =>
    fetchApi<MeetingSummary>(`/api/meetings/${meetingId}/summary/generate`, {
      method: 'POST',
    }),

  // 요약 수정
  update: (meetingId: string, data: Partial<MeetingSummary>) =>
    fetchApi<MeetingSummary>(`/api/meetings/${meetingId}/summary`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 데이터 업데이트 적용
  applyUpdates: (meetingId: string) =>
    fetchApi<{ relationshipId: string; appliedUpdates: Record<string, unknown> }>(
      `/api/meetings/${meetingId}/summary/apply-updates`,
      { method: 'POST' }
    ),

  // 액션 아이템 완료 처리
  completeActionItem: (meetingId: string, index: number) =>
    fetchApi<{ actionItems: string[] }>(
      `/api/meetings/${meetingId}/summary/action-items/${index}/complete`,
      { method: 'POST' }
    ),
};
