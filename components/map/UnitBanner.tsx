'use client';
import { motion } from 'framer-motion';

interface UnitBannerProps {
  title: string;
  unitNumber: number;
  color: string;
  lessonCount: number;
  completedCount: number;
}

export default function UnitBanner({
  title,
  unitNumber,
  color,
  lessonCount,
  completedCount,
}: UnitBannerProps) {
  const progress = lessonCount > 0 ? (completedCount / lessonCount) * 100 : 0;

  return (
    <div
      className="relative overflow-hidden rounded-2xl px-5 py-4 mb-2"
      style={{
        background: `linear-gradient(135deg, ${color}CC, ${color}66)`,
        border: `1px solid ${color}44`,
      }}
    >
      {/* Robot mascot */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 select-none">
        🤖
      </div>

      <div className="relative z-10">
        <p className="text-xs font-bold uppercase tracking-widest text-white/70">
          Unit {unitNumber}
        </p>
        <h3 className="text-base font-bold text-white leading-tight mt-0.5">{title}</h3>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-white/70">{completedCount}/{lessonCount} completed</span>
            <span className="text-xs font-semibold text-white">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
            <motion.div
              className="h-full rounded-full bg-white/80"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
