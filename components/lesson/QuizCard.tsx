'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import type { QuizQuestion } from '@/lib/content/types';

interface QuizCardProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}

export default function QuizCard({ questions, onComplete }: QuizCardProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = questions[current];

  function selectAnswer(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    setShowResult(true);
    if (idx === q.correct) setCorrect((c) => c + 1);
  }

  function next() {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      const score = Math.round(((correct + (selected === q.correct ? 1 : 0)) / questions.length) * 100);
      setFinished(true);
      setTimeout(() => onComplete(score), 800);
    }
  }

  if (finished) {
    const finalScore = Math.round(((correct) / questions.length) * 100);
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-4 rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center"
      >
        <div className="text-5xl">{finalScore === 100 ? '🏆' : finalScore >= 70 ? '🎉' : '📚'}</div>
        <h2 className="text-2xl font-bold text-white">{finalScore}%</h2>
        <p className="text-gray-400">
          {finalScore === 100 ? 'Perfect score!' : `${correct}/${questions.length} correct`}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-800">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((current) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {current + 1} / {questions.length}
        </span>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
            <p className="text-base font-semibold text-white leading-snug">{q.question}</p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {q.options.map((option, idx) => {
              const isSelected = selected === idx;
              const isCorrect = idx === q.correct;
              let bg = 'border-gray-700 bg-gray-900/60 hover:border-gray-500';
              if (showResult && isSelected && isCorrect) bg = 'border-green-500 bg-green-500/10';
              else if (showResult && isSelected && !isCorrect) bg = 'border-red-500 bg-red-500/10';
              else if (showResult && isCorrect) bg = 'border-green-500/50 bg-green-500/5';

              return (
                <button
                  key={idx}
                  onClick={() => selectAnswer(idx)}
                  disabled={selected !== null}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-blue-500 ${bg}`}
                >
                  <span className={showResult && isCorrect ? 'text-green-300' : 'text-gray-200'}>
                    {option}
                  </span>
                  {showResult && isCorrect && <CheckCircle2 size={18} className="text-green-400 shrink-0" />}
                  {showResult && isSelected && !isCorrect && <XCircle size={18} className="text-red-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-xl border border-blue-800/40 bg-blue-950/30 p-4 text-sm text-blue-200"
              >
                💡 {q.explanation}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next button */}
          {showResult && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={next}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-blue-400"
            >
              {current < questions.length - 1 ? 'Next Question' : 'See Results'}
              <ChevronRight size={16} />
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
