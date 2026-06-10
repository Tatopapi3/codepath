'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import type { LessonCard as LessonCardType } from '@/lib/content/types';

interface LessonCardsProps {
  cards: LessonCardType[];
  onComplete: () => void;
}

export default function LessonCards({ cards, onComplete }: LessonCardsProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const card = cards[current];
  const isLast = current === cards.length - 1;

  function goNext() {
    if (isLast) { onComplete(); return; }
    setDirection(1);
    setCurrent((c) => c + 1);
  }

  function goPrev() {
    if (current === 0) return;
    setDirection(-1);
    setCurrent((c) => c - 1);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5">
        {cards.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i < current
                ? 'w-4 bg-green-500'
                : i === current
                ? 'w-4 bg-blue-500'
                : 'w-1.5 bg-gray-700'
            }`}
          />
        ))}
      </div>

      {/* Card */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          initial={{ x: direction * 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction * -60, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="rounded-2xl border border-gray-800 bg-gray-900 p-5"
        >
          <h2 className="mb-3 text-lg font-bold text-white">{card.title}</h2>

          <p className="text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">
            {card.body}
          </p>

          {card.code && (
            <div className="mt-4 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 bg-gray-800 px-4 py-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                {card.language && (
                  <span className="text-xs font-medium text-gray-400 uppercase">{card.language}</span>
                )}
              </div>
              <pre className="bg-gray-950 p-4 text-sm font-mono text-green-300 overflow-x-auto leading-relaxed">
                <code>{card.code}</code>
              </pre>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={goPrev}
          disabled={current === 0}
          className="flex items-center gap-1 rounded-xl border border-gray-700 px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:border-gray-500 disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-blue-500"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        <span className="text-xs text-gray-500">
          {current + 1} / {cards.length}
        </span>

        <button
          onClick={goNext}
          className="flex items-center gap-1 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-blue-400"
        >
          {isLast ? 'Continue' : 'Next'}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
