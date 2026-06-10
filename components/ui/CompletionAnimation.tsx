'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CompletionAnimationProps {
  show: boolean;
  xpGained: number;
  coinsGained: number;
  title: string;
  onDismiss: () => void;
}

export default function CompletionAnimation({
  show, xpGained, coinsGained, title, onDismiss
}: CompletionAnimationProps) {
  const [particles, setParticles] = useState<{ x: number; y: number; color: string }[]>([]);

  useEffect(() => {
    if (show) {
      setParticles(
        Array.from({ length: 12 }, () => ({
          x: Math.random() * 300 - 150,
          y: Math.random() * -200 - 50,
          color: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'][Math.floor(Math.random() * 5)],
        }))
      );
      const timer = setTimeout(onDismiss, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onDismiss}
        >
          <motion.div
            initial={{ scale: 0.5, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative flex flex-col items-center gap-4 rounded-3xl border border-gray-700 bg-gray-900 px-10 py-8 text-center shadow-2xl"
          >
            {/* Particles */}
            {particles.map((p, i) => (
              <motion.div
                key={i}
                className="absolute h-2 w-2 rounded-full"
                style={{ background: p.color, top: '50%', left: '50%' }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{ x: p.x, y: p.y, opacity: 0 }}
                transition={{ duration: 1.2, delay: i * 0.05, ease: 'easeOut' }}
              />
            ))}

            {/* Icon */}
            <motion.div
              animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500/20"
            >
              <Trophy size={40} className="text-yellow-400" />
            </motion.div>

            <h2 className="text-xl font-bold text-white">Lesson Complete!</h2>
            <p className="text-sm text-gray-400">{title}</p>

            {/* Rewards */}
            <div className="flex items-center gap-6 mt-2">
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
                  <Zap size={16} className="text-blue-400" />
                  <span className="text-lg font-bold text-blue-400">+{xpGained}</span>
                </div>
                <span className="text-xs text-gray-500">XP</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
                  <span className="text-base">🪙</span>
                  <span className="text-lg font-bold text-yellow-400">+{coinsGained}</span>
                </div>
                <span className="text-xs text-gray-500">Coins</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-2">Tap anywhere to continue</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
