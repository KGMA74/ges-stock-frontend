import { User } from '@/lib/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  setLoading: (loading: boolean) => void;
  setAuth: (user: User) => void;
  setLogout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isLoading: true,
      user: null,

      setAuth: (user) =>
        set(() => ({
          isAuthenticated: true,
          isLoading: false,
          user,
        })),

      setLogout: () =>
        set(() => ({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        })),

      setLoading: (loading: boolean) => 
        set(() => ({
          isLoading: loading
        }))
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }), // on persiste aussi le user
    }
  )
);
