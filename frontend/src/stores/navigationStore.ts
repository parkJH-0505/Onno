import { create } from 'zustand';
import type { TabType } from '../components/BottomNavigation';

interface NavigationState {
  // 현재 활성 탭
  activeTab: TabType;

  // 네비게이션 표시 여부 (MeetingRoom 등에서 숨김)
  isNavigationVisible: boolean;

  // 서브 뷰 상태 (각 탭 내의 상세 페이지)
  subView: {
    relationships: { detailId: string | null };
    meetings: { detailId: string | null };
  };

  // 회의 시작 시 관계 정보
  meetingContext: {
    relationshipId: string | null;
    relationshipName: string | null;
  };

  // Actions
  setActiveTab: (tab: TabType) => void;
  setNavigationVisible: (visible: boolean) => void;
  goToRelationshipDetail: (id: string) => void;
  goToMeetingDetail: (id: string) => void;
  clearSubView: (tab: 'relationships' | 'meetings') => void;
  startMeetingWithRelationship: (id: string, name?: string) => void;
  clearMeetingContext: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeTab: 'home',
  isNavigationVisible: true,
  subView: {
    relationships: { detailId: null },
    meetings: { detailId: null },
  },
  meetingContext: {
    relationshipId: null,
    relationshipName: null,
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setNavigationVisible: (visible) => set({ isNavigationVisible: visible }),

  goToRelationshipDetail: (id) => set((state) => ({
    activeTab: 'relationships',
    subView: {
      ...state.subView,
      relationships: { detailId: id },
    },
  })),

  goToMeetingDetail: (id) => set((state) => ({
    activeTab: 'meetings',
    subView: {
      ...state.subView,
      meetings: { detailId: id },
    },
  })),

  clearSubView: (tab) => set((state) => ({
    subView: {
      ...state.subView,
      [tab]: { detailId: null },
    },
  })),

  startMeetingWithRelationship: (id, name) => set({
    meetingContext: {
      relationshipId: id,
      relationshipName: name || null,
    },
    isNavigationVisible: false,
  }),

  clearMeetingContext: () => set({
    meetingContext: {
      relationshipId: null,
      relationshipName: null,
    },
    isNavigationVisible: true,
  }),
}));
