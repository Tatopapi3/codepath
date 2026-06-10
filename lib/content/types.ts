export interface LessonCard {
  title: string;
  body: string;
  code?: string;
  language?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface TestCase {
  id: string;
  description: string;
  input?: string;
  expected: string;
}

export interface LessonContent {
  cards: LessonCard[];
}

export interface QuizContent {
  questions: QuizQuestion[];
}

export interface ChallengeContent {
  description: string;
  instructions: string;
  starterCode: string;
  language: string;
  testCases: TestCase[];
  hints?: string[];
}

export interface ReviewContent {
  summary: string;
  keyPoints: string[];
  questions: QuizQuestion[];
}

export type NodeContent = LessonContent | QuizContent | ChallengeContent | ReviewContent;

export type NodeType = 'lesson' | 'quiz' | 'challenge' | 'review';

export interface Language {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
  display_order: number;
  description: string;
}

export interface Unit {
  id: string;
  language_id: string;
  title: string;
  display_order: number;
  color: string;
  description: string;
}

export interface Lesson {
  id: string;
  unit_id: string;
  title: string;
  type: NodeType;
  content_json: NodeContent;
  display_order: number;
  xp_reward: number;
  coin_reward: number;
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  score?: number;
  completed_at?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_required: number;
  badge_color: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  xp: number;
  coins: number;
  streak: number;
  last_active: string;
  rank: string;
}

export interface LessonWithUnit extends Lesson {
  unit: Unit & { language: Language };
}

export const RANK_THRESHOLDS = [
  { min: 0, title: 'Code Journey Initiate' },
  { min: 100, title: 'Code Explorer' },
  { min: 300, title: 'Code Apprentice' },
  { min: 750, title: 'Junior Developer' },
  { min: 1500, title: 'Mid Developer' },
  { min: 2500, title: 'Senior Developer' },
  { min: 5000, title: 'Code Legend' },
] as const;

export function getRank(xp: number): string {
  for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= RANK_THRESHOLDS[i].min) return RANK_THRESHOLDS[i].title;
  }
  return 'Code Journey Initiate';
}
