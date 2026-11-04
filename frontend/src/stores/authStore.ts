import { create } from 'zustand';
import apiClient from '@/api/client';
import type { LoginRequest, LoginResponse, UserDto } from '@/types';

interface AuthState {
  token: string | null;
  user: UserDto | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  setAuth: (token: string, user: UserDto) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('auth_token'),
  user: (() => {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      try {
        return JSON.parse(stored) as UserDto;
      } catch {
        return null;
      }
    }
    return null;
  })(),
  isAuthenticated: Boolean(localStorage.getItem('auth_token')),

  login: async (credentials: LoginRequest) => {
    const response = await apiClient.post<{ data: LoginResponse }>(
      '/auth/login',
      credentials,
    );
    const { token, user } = response.data.data;

    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));

    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    set({ token: null, user: null, isAuthenticated: false });
    window.location.href = '/login';
  },

  setAuth: (token: string, user: UserDto) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },
}));
