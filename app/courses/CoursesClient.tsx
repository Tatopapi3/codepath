'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import BottomNav from '@/components/ui/BottomNav';
import type { Language } from '@/lib/content/types';
import { ChevronRight, Lock } from 'lucide-react';

const LANGUAGE_ICONS: Record<string, string> = {
  python: '🐍',
  javascript: '⚡',
  typescript: '🔷',
  html: '🌐',
  css: '🎨',
  sql: '🗄️',
  react: '⚛️',
  git: '🌿',
};

const DESCRIPTIONS: Record<string, string> = {
  python: 'Learn Python from scratch. Perfect for beginners and data enthusiasts.',
  javascript: 'The language of the web. Build interactive apps and master JS fundamentals.',
  typescript: 'JavaScript with superpowers. Add types and catch bugs before they happen.',
  html: 'Build the skeleton of every website. Learn structure and semantics.',
  css: 'Make things beautiful. Master styling, layouts, and animations.',
  sql: 'Query databases like a pro. From SELECT to complex joins.',
  react: 'The most popular UI library. Build components and manage state.',
  git: 'Version control essentials. Collaborate and track your code history.',
};

interface CoursesClientProps {
  languages: (Language & { units: { count: number }[] })[];
  completedLessonIds: Set<string>;
}

export default function CoursesClient({ languages }: CoursesClientProps) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-gray-950">
      <Header title="Courses" />

      <main className="mx-auto w-full max-w-[430px] flex-1 px-4 pb-24 pt-4">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-white">Choose Your Path</h2>
          <p className="text-sm text-gray-400 mt-1">
            8 languages. Learn at your own pace.
          </p>
        </div>

        <div className="space-y-3">
          {languages.map((lang, idx) => {
            const isLocked = idx > 1; // Lock all except Python & JS for v1
            const icon = LANGUAGE_ICONS[lang.slug] ?? '💻';
            const desc = DESCRIPTIONS[lang.slug] ?? '';

            return (
              <button
                key={lang.id}
                onClick={() => !isLocked && router.push(`/learn?lang=${lang.slug}`)}
                disabled={isLocked}
                className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border p-4 text-left transition-all ${
                  isLocked
                    ? 'cursor-not-allowed border-gray-800 bg-gray-900/30 opacity-60'
                    : 'cursor-pointer border-gray-700 bg-gray-900 hover:border-gray-500 active:scale-[0.98]'
                } focus-visible:outline-2 focus-visible:outline-blue-500`}
                style={!isLocked ? { borderColor: lang.color + '44' } : undefined}
              >
                {/* Color accent bar */}
                {!isLocked && (
                  <div
                    className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
                    style={{ background: lang.color }}
                  />
                )}

                <span className="pl-2 text-3xl">{icon}</span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{lang.name}</h3>
                    {isLocked && <Lock size={12} className="text-gray-500" />}
                    {!isLocked && idx === 0 && (
                      <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-bold text-green-400">
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400 leading-snug">{desc}</p>
                </div>

                {!isLocked && (
                  <ChevronRight size={18} className="shrink-0 text-gray-600 group-hover:text-gray-400 transition-colors" />
                )}
              </button>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
