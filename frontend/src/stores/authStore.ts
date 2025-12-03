import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = import.meta.env.VITE_API_URL || 'https://onno-backend.onrender.com';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'INVESTOR' | 'ACCELERATOR' | 'FOUNDER' | 'OTHER';
  company?: string | null;
  jobTitle?: string | null;
  avatarUrl?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  register: (email: string, password: string, name?: string, role?: User['role']) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  checkAuth: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      register: async (email, password, name, role) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name, role }),
          });

          const data = await response.json();

          if (!data.success) {
            set({ isLoading: false, error: data.error });
            return false;
          }

          set({
            user: data.data.user,
            token: data.data.token,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: '회원가입 중 오류가 발생했습니다.',
          });
          return false;
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!data.success) {
            set({ isLoading: false, error: data.error });
            return false;
          }

          set({
            user: data.data.user,
            token: data.data.token,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: '로그인 중 오류가 발생했습니다.',
          });
          return false;
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null });
      },

      updateProfile: async (data) => {
        const { token } = get();
        if (!token) return false;

        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/api/auth/profile`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          });

          const result = await response.json();

          if (!result.success) {
            set({ isLoading: false, error: result.error });
            return false;
          }

          set((state) => ({
            user: state.user ? { ...state.user, ...result.data } : null,
            isLoading: false,
            error: null,
          }));
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: '프로필 업데이트 중 오류가 발생했습니다.',
          });
          return false;
        }
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) return false;

        try {
          const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (!data.success) {
            set({ user: null, token: null });
            return false;
          }

          set({ user: data.data });
          return true;
        } catch (error) {
          set({ user: null, token: null });
          return false;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'onno-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
