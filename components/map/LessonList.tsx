'use client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, CheckSquare, Code2, RefreshCw, Lock, CheckCircle2, Zap } from 'lucide-react';
import type { Lesson, UserProgress, NodeType } from '@/lib/content/types';

interface LessonListProps {
  lessons: Lesson[];
  progress: Record<string, UserProgress>;
  color: string;
  currentLessonId: string | null;
  unitTitle: string;
}

const TYPE_CONFIG: Record<NodeType, { label: string; icon: React.ElementType; bg: string; text: string }> = {
  lesson:    { label: 'LEARN',    icon: Book,        bg: 'bg-blue-500/20',   text: 'text-blue-400' },
  quiz:      { label: 'QUIZ',     icon: CheckSquare, bg: 'bg-green-500/20',  text: 'text-green-400' },
  challenge: { label: 'PRACTICE', icon: Zap,         bg: 'bg-amber-500/20',  text: 'text-amber-400' },
  review:    { label: 'REVIEW',   icon: RefreshCw,   bg: 'bg-purple-500/20', text: 'text-purple-400' },
};

export default function LessonList({ lessons, progress, color, currentLessonId, unitTitle }: LessonListProps) {
  const router = useRouter();

  const projectLesson = lessons.find((l) => l.type === 'challenge');

  function getLessonState(lesson: Lesson, idx: number): 'completed' | 'current' | 'locked' {
    if (progress[lesson.id]?.completed) return 'completed';
    if (lesson.id === currentLessonId) return 'current';
    if (idx === 0) return 'current';
    const prev = lessons[idx - 1];
    if (prev && !progress[prev.id]?.completed) return 'locked';
    return 'current';
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="overflow-hidden mb-2"
    >
      {/* Section Project Card */}
      {projectLesson && (
        <div className="mb-3 rounded-xl border border-gray-700/50 bg-gray-800/30 overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-700/50">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Section Project
            </span>
          </div>
          <div
            className="px-4 py-3 cursor-pointer hover:bg-gray-700/30 transition-colors"
            onClick={() => router.push(`/lesson/${projectLesson.id}`)}
          >
            <h4 className="text-sm font-bold text-white">{projectLesson.title}</h4>
            <p className="text-xs text-gray-400 mt-0.5">{unitTitle} — hands-on project</p>
          </div>
        </div>
      )}

      {/* Lesson rows */}
      <div className="flex flex-col rounded-xl border border-gray-800/50 overflow-hidden divide-y divide-gray-800/50">
        {lessons.map((lesson, idx) => {
          const state = getLessonState(lesson, idx);
          const isLocked = state === 'locked';
          const isCompleted = state === 'completed';
          const isCurrent = state === 'current' && !isCompleted;
          const cfg = TYPE_CONFIG[lesson.type];
          const Icon = cfg.icon as React.FC<{ size?: number }>;

          return (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-800/50'
              } ${isCurrent ? 'border-l-2 bg-gray-800/40' : ''}`}
              style={isCurrent ? { borderLeftColor: color } : {}}
              onClick={() => !isLocked && router.push(`/lesson/${lesson.id}`)}
            >
              {/* Number */}
              <span className="w-6 shrink-0 text-xs font-bold text-gray-500">
                {String(idx + 1).padStart(2, '0')}
              </span>

              {/* Title */}
              <span className={`flex-1 text-sm font-medium leading-tight ${isLocked ? 'text-gray-500' : 'text-gray-100'}`}>
                {lesson.title}
              </span>

              {/* Type badge */}
              {!isLocked && (
                <span className={`flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${cfg.bg} ${cfg.text}`}>
                  <Icon size={10} />
                  {cfg.label}
                </span>
              )}

              {/* Status icon */}
              {isCompleted && <CheckCircle2 size={16} className="shrink-0 text-green-400" />}
              {isLocked && <Lock size={14} className="shrink-0 text-gray-600" />}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
