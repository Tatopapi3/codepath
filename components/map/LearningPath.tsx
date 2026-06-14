'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UnitBanner from './UnitBanner';
import LessonList from './LessonList';
import type { Unit, Lesson, UserProgress, Language } from '@/lib/content/types';

interface LearningPathProps {
  language: Language;
  units: (Unit & { lessons: Lesson[] })[];
  progress: Record<string, UserProgress>;
}

export default function LearningPath({ language, units, progress }: LearningPathProps) {
  const allLessons = units
    .flatMap((u) => u.lessons)
    .sort((a, b) => {
      const ua = units.findIndex((u) => u.id === a.unit_id);
      const ub = units.findIndex((u) => u.id === b.unit_id);
      if (ua !== ub) return ua - ub;
      return a.display_order - b.display_order;
    });

  const firstIncompleteIdx = allLessons.findIndex((l) => !progress[l.id]?.completed);
  const currentLessonId = firstIncompleteIdx >= 0 ? allLessons[firstIncompleteIdx].id : null;

  // Auto-expand the unit that contains the current lesson
  const currentUnit = units.find((u) => u.lessons.some((l) => l.id === currentLessonId));
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(
    currentUnit?.id ?? units[0]?.id ?? null
  );

  function toggleUnit(unitId: string) {
    setExpandedUnitId((prev) => (prev === unitId ? null : unitId));
  }

  return (
    <div className="space-y-1 pb-4">
      {units.map((unit, unitIdx) => {
        const sortedLessons = [...unit.lessons].sort((a, b) => a.display_order - b.display_order);
        const completedInUnit = sortedLessons.filter((l) => progress[l.id]?.completed).length;
        const isExpanded = expandedUnitId === unit.id;

        return (
          <motion.div
            key={unit.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: unitIdx * 0.08 }}
          >
            <UnitBanner
              title={unit.title}
              unitNumber={unit.display_order}
              color={language.color}
              lessonCount={sortedLessons.length}
              completedCount={completedInUnit}
              isExpanded={isExpanded}
              onToggle={() => toggleUnit(unit.id)}
            />

            <AnimatePresence>
              {isExpanded && (
                <LessonList
                  lessons={sortedLessons}
                  progress={progress}
                  color={language.color}
                  currentLessonId={currentLessonId}
                  unitTitle={unit.title}
                />
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
