'use client';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface UnitBannerProps {
  title: string;
  unitNumber: number;
  color: string;
  lessonCount: number;
  completedCount: number;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export default function UnitBanner({
  title,
  unitNumber,
  color,
  lessonCount,
  completedCount,
  isExpanded = false,
  onToggle,
}: UnitBannerProps) {
  const progress = lessonCount > 0 ? (completedCount / lessonCount) * 100 : 0;

  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full text-left relative overflow-hidden rounded-2xl px-5 py-4 mb-1 focus-visible:outline-2 focus-visible:outline-white"
      style={{
        background: `linear-gradient(135deg, ${color}CC, ${color}66)`,
        border: `1px solid ${color}44`,
      }}
    >
      {/* Faint robot mascot */}
      <div className="pointer-events-none absolute right-14 top-1/2 -translate-y-1/2 select-none text-5xl opacity-10">
        🤖
      </div>

      <div className="relative z-10 flex items-center gap-4">
        {/* Circular progress ring */}
        <div className="relative shrink-0">
          <svg width="56" height="56" viewBox="0 0 56 56">
            <circle
              cx="28" cy="28" r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="4"
            />
            <motion.circle
              cx="28" cy="28" r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              transform="rotate(-90 28 28)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-white/70">
            Unit {unitNumber}
          </p>
          <h3 className="mt-0.5 truncate text-base font-bold leading-tight text-white">
            {title}
          </h3>
          <p className="mt-1 text-xs text-white/60">
            {completedCount}/{lessonCount} completed
          </p>
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown size={20} className="text-white/70" />
        </motion.div>
      </div>
    </button>
  );
}
