'use client';
import Header from '@/components/ui/Header';
import BottomNav from '@/components/ui/BottomNav';
import { Flame, Zap, Trophy, Calendar } from 'lucide-react';
import type { UserProfile } from '@/lib/content/types';

interface ActivityItem {
  id: string;
  completed_at: string;
  score?: number;
  lesson: {
    title: string;
    type: string;
    unit: { title: string; language: { name: string; color: string } };
  };
}

interface ActivityClientProps {
  profile: UserProfile | null;
  recentProgress: ActivityItem[];
}

function getCalendarDays(completions: ActivityItem[]) {
  const completedDates = new Set(
    completions.map((c) => new Date(c.completed_at).toISOString().split('T')[0])
  );

  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const str = d.toISOString().split('T')[0];
    days.push({ date: str, active: completedDates.has(str) });
  }
  return days;
}

const TYPE_ICONS: Record<string, string> = {
  lesson: '📖',
  quiz: '✅',
  challenge: '💻',
  review: '🔄',
};

export default function ActivityClient({ profile, recentProgress }: ActivityClientProps) {
  const calendarDays = getCalendarDays(recentProgress);
  const activeDays = calendarDays.filter((d) => d.active).length;

  return (
    <div className="flex min-h-screen flex-col bg-gray-950">
      <Header title="Activity" />

      <main className="mx-auto w-full max-w-[430px] flex-1 px-4 pb-24 pt-4 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Streak', value: profile?.streak ?? 0, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
            { label: 'Total XP', value: profile?.xp ?? 0, icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Active Days', value: activeDays, icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`rounded-2xl border border-gray-800 ${bg} p-3 text-center`}>
              <Icon size={20} className={`${color} mx-auto mb-1`} />
              <p className={`text-xl font-black ${color}`}>{value}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* 30-day calendar */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Calendar size={16} className="text-purple-400" />
            30-Day Calendar
          </h3>
          <div className="grid grid-cols-10 gap-1.5">
            {calendarDays.map((day) => (
              <div
                key={day.date}
                title={day.date}
                className={`h-6 w-full rounded-sm transition-colors ${
                  day.active
                    ? 'bg-green-500'
                    : 'bg-gray-800'
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">{activeDays} active days this month</p>
        </div>

        {/* Recent completions */}
        <div>
          <h3 className="text-sm font-bold text-white mb-3">Recent Completions</h3>
          {recentProgress.length === 0 ? (
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 text-center">
              <p className="text-4xl mb-2">🌱</p>
              <p className="text-sm text-gray-400">No completions yet. Start learning!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentProgress.slice(0, 20).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900 px-4 py-3"
                >
                  <span className="text-xl shrink-0">{TYPE_ICONS[item.lesson.type] ?? '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.lesson.title}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {item.lesson.unit.language.name} · {item.lesson.unit.title}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {item.score != null && (
                      <p className="text-xs font-bold text-green-400">{item.score}%</p>
                    )}
                    <p className="text-[10px] text-gray-600">
                      {new Date(item.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
