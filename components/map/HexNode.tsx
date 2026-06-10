'use client';
import { motion } from 'framer-motion';
import { Book, CheckSquare, Code2, RefreshCw, Lock, CheckCircle2 } from 'lucide-react';
import type { NodeType } from '@/lib/content/types';

interface HexNodeProps {
  type: NodeType;
  title: string;
  state: 'completed' | 'current' | 'locked';
  color: string;
  onClick?: () => void;
  xpReward?: number;
}

type LucideIcon = React.FC<React.SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }>;

const typeIcons: Record<NodeType, LucideIcon> = {
  lesson: Book as LucideIcon,
  quiz: CheckSquare as LucideIcon,
  challenge: Code2 as LucideIcon,
  review: RefreshCw as LucideIcon,
};

const typeColors: Record<NodeType, string> = {
  lesson: '#3B82F6',
  quiz: '#10B981',
  challenge: '#F59E0B',
  review: '#8B5CF6',
};

export default function HexNode({ type, title, state, color, onClick, xpReward }: HexNodeProps) {
  const Icon = typeIcons[type];
  const isLocked = state === 'locked';
  const isCompleted = state === 'completed';
  const isCurrent = state === 'current';

  const nodeColor = isLocked ? '#374151' : isCompleted ? '#10B981' : color;
  const iconColor = isLocked ? '#6B7280' : '#FFFFFF';

  // SVG hexagon points for a flat-top hex
  const size = 56;
  const hexPoints = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30);
    return `${size / 2 + (size / 2 - 4) * Math.cos(angle)},${size / 2 + (size / 2 - 4) * Math.sin(angle)}`;
  }).join(' ');

  return (
    <motion.div
      className="flex flex-col items-center gap-2 cursor-pointer select-none"
      onClick={!isLocked ? onClick : undefined}
      whileTap={!isLocked ? { scale: 0.95 } : undefined}
      initial={false}
      role="button"
      tabIndex={isLocked ? -1 : 0}
      onKeyDown={(e) => { if (e.key === 'Enter' && !isLocked && onClick) onClick(); }}
      aria-label={`${type}: ${title} — ${state}`}
    >
      <div className="relative">
        {/* Pulse ring for current node */}
        {isCurrent && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background: `radial-gradient(circle, ${nodeColor}40, transparent)`,
              borderRadius: '50%',
            }}
          />
        )}

        {/* SVG Hex */}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Shadow */}
          <polygon
            points={hexPoints}
            fill="#000000"
            opacity={0.3}
            transform="translate(0, 3)"
          />
          {/* Main fill */}
          <polygon
            points={hexPoints}
            fill={nodeColor}
            className="transition-colors duration-300"
          />
          {/* Highlight */}
          <polygon
            points={hexPoints}
            fill="url(#hexHighlight)"
            opacity={isLocked ? 0 : 0.3}
          />
          <defs>
            <linearGradient id="hexHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.5" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isLocked ? (
            <Lock size={20} style={{ color: iconColor }} strokeWidth={2} />
          ) : (
            <Icon size={20} style={{ color: iconColor }} strokeWidth={2} />
          )}
        </div>

        {/* Completed badge */}
        {isCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1 -top-1"
          >
            <CheckCircle2 size={18} className="fill-gray-950 text-green-400" strokeWidth={2} />
          </motion.div>
        )}
      </div>

      {/* Title */}
      <span
        className={`max-w-[80px] text-center text-[11px] font-medium leading-tight ${
          isLocked ? 'text-gray-600' : 'text-gray-200'
        }`}
      >
        {title}
      </span>

      {/* XP badge */}
      {!isLocked && xpReward && !isCompleted && (
        <span className="rounded-full bg-gray-800 px-2 py-0.5 text-[10px] font-semibold text-yellow-400">
          +{xpReward} XP
        </span>
      )}
    </motion.div>
  );
}
