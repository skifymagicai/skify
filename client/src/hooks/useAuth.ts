import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../lib/api.js';
import { User } from '../../../shared/types.js';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.login({ email, password });
          apiClient.setToken(response.data.token);
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (username: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.register({ username, email, password });
          apiClient.setToken(response.data.token);
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await apiClient.logout();
        } catch (error) {
          console.error('Logout error:', error);
        }
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      refreshUser: async () => {
        if (!get().isAuthenticated) return;
        
        try {
          const response = await apiClient.getMe();
          set({ user: response.data.user });
        } catch (error) {
          console.error('Failed to refresh user:', error);
          // Token might be expired, log out
          get().logout();
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('skify_token');
        if (!token) {
          set({ isAuthenticated: false });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await apiClient.getMe();
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // Token is invalid
          apiClient.clearToken();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);