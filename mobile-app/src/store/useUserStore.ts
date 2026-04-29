import { create } from 'zustand';
import { UserResponse } from '../api/authApi';

interface UserState {
  user: UserResponse | null;
  isLoading: boolean;
  setUser: (user: UserResponse) => void;
  updateUser: (updates: Partial<UserResponse>) => void;
  setLoading: (status: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: true, // Uygulama ilk açıldığında UUID kontrolü yapıldığı için true başlar
  setUser: (user) => set({ user, isLoading: false }),
  updateUser: (updates) => set((state) => ({ 
      user: state.user ? { ...state.user, ...updates, level: { ...state.user.level, ...updates.level } } : null 
  })),
  setLoading: (status) => set({ isLoading: status }),
}));
