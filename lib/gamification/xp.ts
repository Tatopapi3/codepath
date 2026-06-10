import { getRank } from '@/lib/content/types';

export const XP_REWARDS = {
  lesson: 15,
  quiz: 20,
  challenge: 30,
  review: 10,
  perfect_quiz: 10,      // bonus for 100% quiz
  first_lesson: 50,      // first ever lesson
  streak_bonus: 5,       // per active day streak
} as const;

export const COIN_REWARDS = {
  lesson: 5,
  quiz: 8,
  challenge: 12,
  review: 5,
  perfect_quiz: 5,
} as const;

export interface XPGain {
  base: number;
  bonus: number;
  total: number;
  reason: string[];
}

export function calcXP(
  type: 'lesson' | 'quiz' | 'challenge' | 'review',
  score: number | null,
  isFirst: boolean,
  streak: number
): XPGain {
  const base = XP_REWARDS[type];
  const reasons: string[] = [`${base} XP for completing ${type}`];
  let bonus = 0;

  if (type === 'quiz' && score === 100) {
    bonus += XP_REWARDS.perfect_quiz;
    reasons.push(`+${XP_REWARDS.perfect_quiz} XP perfect score!`);
  }
  if (isFirst) {
    bonus += XP_REWARDS.first_lesson;
    reasons.push(`+${XP_REWARDS.first_lesson} XP first lesson bonus!`);
  }
  if (streak > 2) {
    bonus += XP_REWARDS.streak_bonus;
    reasons.push(`+${XP_REWARDS.streak_bonus} XP streak bonus`);
  }

  return { base, bonus, total: base + bonus, reason: reasons };
}

export function calcCoins(
  type: 'lesson' | 'quiz' | 'challenge' | 'review',
  score: number | null
): number {
  let coins = COIN_REWARDS[type];
  if (type === 'quiz' && score === 100) coins += COIN_REWARDS.perfect_quiz;
  return coins;
}

export function getLevelFromXP(xp: number): { rank: string; nextRankXP: number; progress: number } {
  const rank = getRank(xp);
  const thresholds = [0, 100, 300, 750, 1500, 2500, 5000, Infinity];
  let nextRankXP = 5000;
  let currentMin = 0;

  for (let i = 0; i < thresholds.length - 1; i++) {
    if (xp >= thresholds[i] && xp < thresholds[i + 1]) {
      currentMin = thresholds[i];
      nextRankXP = thresholds[i + 1] === Infinity ? thresholds[i] : thresholds[i + 1];
      break;
    }
  }

  const range = nextRankXP - currentMin;
  const progress = range > 0 ? Math.min(100, Math.round(((xp - currentMin) / range) * 100)) : 100;

  return { rank, nextRankXP, progress };
}
