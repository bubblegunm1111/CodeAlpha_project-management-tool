import { create } from 'zustand';
import { authAPI } from '../api/client';

interface User {
  id: number;
  email: string;
  name: string;
  avatar_url?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  register: (email: string, name: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,

  register: async (email, name, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register(email, name, password);
      localStorage.setItem('token', response.data.token);
      set({
        user: response.data.user,
        token: response.data.token,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login(email, password);
      localStorage.setItem('token', response.data.token);
      set({
        user: response.data.user,
        token: response.data.token,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  initialize: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      set({ token, isLoading: true });
      try {
        const response = await authAPI.me();
        set({ user: response.data, isLoading: false });
      } catch (error) {
        localStorage.removeItem('token');
        set({ token: null, user: null, isLoading: false });
      }
    }
  },
}));
