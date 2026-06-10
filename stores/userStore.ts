'use client';
import { create } from 'zustand';
import type { UserProfile } from '@/lib/content/types';

interface UserStore {
  user: UserProfile | null;
  loading: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  incrementStreak: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  addXP: (amount) =>
    set((s) => {
      if (!s.user) return s;
      const newXP = s.user.xp + amount;
      return { user: { ...s.user, xp: newXP } };
    }),
  addCoins: (amount) =>
    set((s) => {
      if (!s.user) return s;
      return { user: { ...s.user, coins: s.user.coins + amount } };
    }),
  spendCoins: (amount) => {
    const { user } = get();
    if (!user || user.coins < amount) return false;
    set({ user: { ...user, coins: user.coins - amount } });
    return true;
  },
  incrementStreak: () =>
    set((s) => {
      if (!s.user) return s;
      return { user: { ...s.user, streak: s.user.streak + 1 } };
    }),
}));
