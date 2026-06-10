'use client';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Trophy } from 'lucide-react';

interface TestResult {
  id: string;
  description: string;
  passed: boolean;
  expected: string;
  got: string;
}

interface TestResultsProps {
  results: TestResult[];
  allPassed: boolean;
}

export default function TestResults({ results, allPassed }: TestResultsProps) {
  const passedCount = results.filter((r) => r.passed).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Summary */}
      <div
        className={`flex items-center gap-3 rounded-xl border p-4 ${
          allPassed
            ? 'border-green-600/40 bg-green-950/30 text-green-300'
            : 'border-red-600/40 bg-red-950/30 text-red-300'
        }`}
      >
        {allPassed ? (
          <Trophy size={20} className="text-yellow-400 shrink-0" />
        ) : (
          <XCircle size={20} className="shrink-0" />
        )}
        <div>
          <p className="text-sm font-bold">
            {allPassed ? 'All tests passed! 🎉' : `${passedCount}/${results.length} tests passed`}
          </p>
          {!allPassed && (
            <p className="text-xs opacity-70">Fix the failing tests and try again.</p>
          )}
        </div>
      </div>

      {/* Individual tests */}
      <div className="space-y-2">
        {results.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`rounded-xl border p-3 ${
              r.passed ? 'border-green-800/40 bg-gray-900' : 'border-red-800/40 bg-gray-900'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {r.passed ? (
                <CheckCircle2 size={14} className="text-green-400 shrink-0" />
              ) : (
                <XCircle size={14} className="text-red-400 shrink-0" />
              )}
              <span className="text-xs font-semibold text-gray-300">{r.description}</span>
            </div>
            {!r.passed && (
              <div className="ml-5 space-y-1 text-xs font-mono">
                <p className="text-gray-500">
                  Expected: <span className="text-green-400">{r.expected}</span>
                </p>
                <p className="text-gray-500">
                  Got: <span className="text-red-400">{r.got}</span>
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
