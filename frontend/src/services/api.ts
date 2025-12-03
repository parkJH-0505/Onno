const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:6001';

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
