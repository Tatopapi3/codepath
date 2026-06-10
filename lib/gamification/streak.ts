export function isStreakActive(lastActive: string | null): boolean {
  if (!lastActive) return false;
  const last = new Date(lastActive);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastDateStr = last.toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];
  const yestStr = yesterday.toISOString().split('T')[0];

  return lastDateStr === todayStr || lastDateStr === yestStr;
}

export function shouldIncrementStreak(lastActive: string | null): boolean {
  if (!lastActive) return true;
  const last = new Date(lastActive);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const lastDateStr = last.toISOString().split('T')[0];
  const yestStr = yesterday.toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];

  // Increment if last active was yesterday (streak continues) or earlier (new start)
  return lastDateStr !== todayStr;
}

export function getStreakStatus(streak: number): {
  label: string;
  emoji: string;
  color: string;
} {
  if (streak === 0) return { label: 'Start your streak!', emoji: '🌱', color: 'text-gray-400' };
  if (streak < 3) return { label: `${streak} day streak`, emoji: '🔥', color: 'text-orange-400' };
  if (streak < 7) return { label: `${streak} day streak`, emoji: '🔥', color: 'text-orange-500' };
  if (streak < 30) return { label: `${streak} day streak`, emoji: '🔥', color: 'text-red-500' };
  return { label: `${streak} day streak`, emoji: '🏆', color: 'text-yellow-400' };
}
