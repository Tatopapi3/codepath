'use client';
import { getLevelFromXP } from '@/lib/gamification/xp';
import { useUserStore } from '@/stores/userStore';

export default function XPBar() {
  const user = useUserStore((s) => s.user);
  const xp = user?.xp ?? 0;
  const { rank, nextRankXP, progress } = getLevelFromXP(xp);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-blue-400">{rank}</span>
        <span className="text-gray-400">{xp} / {nextRankXP} XP</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
