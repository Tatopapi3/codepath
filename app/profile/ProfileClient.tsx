'use client';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/ui/Header';
import BottomNav from '@/components/ui/BottomNav';
import XPBar from '@/components/ui/XPBar';
import { getLevelFromXP } from '@/lib/gamification/xp';
import { LogOut, Trophy, RotateCcw } from 'lucide-react';
import type { Achievement, UserProfile } from '@/lib/content/types';
import { useEffect, useState } from 'react';
import { useUserStore } from '@/stores/userStore';

interface ProfileClientProps {
  profile: UserProfile | null;
  achievements: Achievement[];
  earnedIds: Set<string>;
  completedLessons: number;
}

export default function ProfileClient({ profile, achievements, earnedIds, completedLessons }: ProfileClientProps) {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => { if (profile) setUser(profile); }, [profile, setUser]);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  }

  async function handleResetProgress() {
    setResetting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('user_progress').delete().eq('user_id', user.id);
      await supabase.from('users').update({ xp: 0, coins: 0, streak: 0 }).eq('id', user.id);
    }
    setResetting(false);
    setShowResetConfirm(false);
    router.refresh();
  }

  const xp = profile?.xp ?? 0;
  const { rank } = getLevelFromXP(xp);

  const AVATAR_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'];
  const avatarColor = AVATAR_COLORS[(profile?.username?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
  const initials = (profile?.username ?? 'U').slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-gray-950">
      <Header title="Profile" />

      <main className="mx-auto w-full max-w-[430px] flex-1 px-4 pb-24 pt-4 space-y-5">
        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-3 pt-4">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-black text-white"
            style={{ background: avatarColor }}
          >
            {initials}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-black text-white">{profile?.username ?? 'Coder'}</h2>
            <p className="text-sm text-blue-400 font-medium">{rank}</p>
          </div>
        </div>

        {/* XP bar */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
          <XPBar />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'XP Earned', value: xp.toLocaleString(), icon: '⚡', color: 'text-blue-400' },
            { label: 'Coins', value: (profile?.coins ?? 0).toLocaleString(), icon: '🪙', color: 'text-yellow-400' },
            { label: 'Day Streak', value: profile?.streak ?? 0, icon: '🔥', color: 'text-orange-400' },
            { label: 'Completed', value: completedLessons, icon: '✅', color: 'text-green-400' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="rounded-2xl border border-gray-800 bg-gray-900 p-4 text-center">
              <p className="text-2xl mb-1">{icon}</p>
              <p className={`text-xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div>
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Trophy size={16} className="text-yellow-400" />
            Achievements ({earnedIds.size}/{achievements.length})
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {achievements.map((a) => {
              const earned = earnedIds.has(a.id);
              return (
                <div
                  key={a.id}
                  className={`flex items-center gap-3 rounded-xl border p-3 ${
                    earned
                      ? 'border-yellow-600/30 bg-yellow-950/20'
                      : 'border-gray-800 bg-gray-900 opacity-50'
                  }`}
                >
                  <span className="text-2xl">{a.icon}</span>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold ${earned ? 'text-yellow-300' : 'text-gray-400'} truncate`}>
                      {a.name}
                    </p>
                    <p className="text-[10px] text-gray-600 truncate">{a.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reset Progress */}
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-900 py-3.5 text-sm font-semibold text-gray-400 hover:bg-gray-800 transition-colors"
          >
            <RotateCcw size={16} />
            Reset Progress
          </button>
        ) : (
          <div className="rounded-xl border border-orange-800/40 bg-orange-950/20 p-4 space-y-3">
            <p className="text-sm font-semibold text-orange-300 text-center">Reset all progress?</p>
            <p className="text-xs text-gray-400 text-center">
              This will delete all completed lessons, XP, coins, and streaks. This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 rounded-lg border border-gray-700 py-2.5 text-sm font-semibold text-gray-400 hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetProgress}
                disabled={resetting}
                className="flex-1 rounded-lg bg-orange-600 py-2.5 text-sm font-bold text-white hover:bg-orange-500 disabled:opacity-60 transition-colors"
              >
                {resetting ? 'Resetting…' : 'Yes, Reset'}
              </button>
            </div>
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-900/30 bg-red-950/20 py-3.5 text-sm font-semibold text-red-400 hover:bg-red-950/40 transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
