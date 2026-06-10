'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import HexNode from './HexNode';
import UnitBanner from './UnitBanner';
import type { Unit, Lesson, UserProgress, Language } from '@/lib/content/types';

interface LearningPathProps {
  language: Language;
  units: (Unit & { lessons: Lesson[] })[];
  progress: Record<string, UserProgress>;
}

export default function LearningPath({ language, units, progress }: LearningPathProps) {
  const router = useRouter();

  // Determine which lesson is the current (first incomplete)
  const allLessons = units.flatMap((u) => u.lessons).sort((a, b) => {
    const ua = units.findIndex((u) => u.id === a.unit_id);
    const ub = units.findIndex((u) => u.id === b.unit_id);
    if (ua !== ub) return ua - ub;
    return a.display_order - b.display_order;
  });

  const firstIncompleteIdx = allLessons.findIndex(
    (l) => !progress[l.id]?.completed
  );
  const currentLessonId =
    firstIncompleteIdx >= 0 ? allLessons[firstIncompleteIdx].id : null;

  function getNodeState(lesson: Lesson, lessonIdx: number): 'completed' | 'current' | 'locked' {
    if (progress[lesson.id]?.completed) return 'completed';
    if (lesson.id === currentLessonId) return 'current';

    // Find global index of this lesson
    const globalIdx = allLessons.findIndex((l) => l.id === lesson.id);
    if (globalIdx === 0) return 'current';

    // Locked if previous lesson is not complete
    const prevLesson = allLessons[globalIdx - 1];
    if (prevLesson && !progress[prevLesson.id]?.completed) return 'locked';

    return 'current';
  }

  // Zigzag positions: alternate left/right
  const POSITIONS = ['left', 'right', 'left', 'right'] as const;

  return (
    <div className="space-y-6 pb-4">
      {units.map((unit, unitIdx) => {
        const completedInUnit = unit.lessons.filter(
          (l) => progress[l.id]?.completed
        ).length;

        return (
          <motion.div
            key={unit.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: unitIdx * 0.1 }}
          >
            <UnitBanner
              title={unit.title}
              unitNumber={unit.display_order}
              color={language.color}
              lessonCount={unit.lessons.length}
              completedCount={completedInUnit}
            />

            {/* Hex nodes in zigzag */}
            <div className="relative mt-2 space-y-6">
              {unit.lessons
                .sort((a, b) => a.display_order - b.display_order)
                .map((lesson, lessonIdx) => {
                  const side = POSITIONS[lessonIdx % POSITIONS.length];
                  const nodeState = getNodeState(lesson, lessonIdx);

                  return (
                    <div
                      key={lesson.id}
                      className={`flex ${
                        side === 'left'
                          ? 'justify-start pl-8'
                          : 'justify-end pr-8'
                      }`}
                    >
                      <HexNode
                        type={lesson.type}
                        title={lesson.title}
                        state={nodeState}
                        color={language.color}
                        xpReward={lesson.xp_reward}
                        onClick={() => router.push(`/lesson/${lesson.id}`)}
                      />
                    </div>
                  );
                })}

              {/* Connecting line between nodes */}
              <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-gray-700 to-transparent opacity-40" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
