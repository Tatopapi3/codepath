'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUserStore } from '@/stores/userStore';
import LessonCards from '@/components/lesson/LessonCard';
import QuizCard from '@/components/lesson/QuizCard';
import CodeEditor from '@/components/lesson/CodeEditor';
import CompletionAnimation from '@/components/ui/CompletionAnimation';
import ChatBot from '@/components/tutor/ChatBot';
import { calcXP, calcCoins } from '@/lib/gamification/xp';
import type { LessonWithUnit, LessonContent, QuizContent, ChallengeContent, ReviewContent } from '@/lib/content/types';

interface LessonClientProps {
  lesson: LessonWithUnit & { unit: { language: { name: string; color: string; slug: string }; title: string } };
  userId: string;
  profile: { xp: number; coins: number; streak: number; last_active: string } | null;
  alreadyCompleted: boolean;
}

export default function LessonClient({ lesson, userId, profile, alreadyCompleted }: LessonClientProps) {
  const router = useRouter();
  const { addXP, addCoins } = useUserStore();
  const [phase, setPhase] = useState<'content' | 'done'>('content');
  const [showAnim, setShowAnim] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [coinsGained, setCoinsGained] = useState(0);

  const lang = lesson.unit.language;
  const type = lesson.type as 'lesson' | 'quiz' | 'challenge' | 'review';
  const content = lesson.content_json;

  async function handleComplete(score?: number) {
    if (phase === 'done') return;

    const supabase = createClient();

    if (!alreadyCompleted) {
      const isFirst = !profile || profile.xp === 0;
      const streak = profile?.streak ?? 0;

      const xpCalc = calcXP(type, score ?? null, isFirst, streak);
      const coins = calcCoins(type, score ?? null);

      setXpGained(xpCalc.total);
      setCoinsGained(coins);

      await supabase.from('user_progress').upsert(
        { user_id: userId, lesson_id: lesson.id, completed: true, score: score ?? null, completed_at: new Date().toISOString() },
        { onConflict: 'user_id,lesson_id' }
      );

      const newXP = (profile?.xp ?? 0) + xpCalc.total;
      const newCoins = (profile?.coins ?? 0) + coins;

      await supabase.from('users').update({
        xp: newXP, coins: newCoins, last_active: new Date().toISOString().split('T')[0],
      }).eq('id', userId);

      addXP(xpCalc.total);
      addCoins(coins);
      setShowAnim(true);
    }

    setPhase('done');
  }

  function handleAnimDismiss() {
    setShowAnim(false);
    router.push('/learn');
  }

  const typeLabel = {
    lesson: 'Lesson',
    quiz: 'Quiz',
    challenge: 'Code Challenge',
    review: 'Review',
  }[type];

  const typeColor = {
    lesson: '#3B82F6',
    quiz: '#10B981',
    challenge: '#F59E0B',
    review: '#8B5CF6',
  }[type];

  return (
    <div className="flex min-h-screen flex-col bg-gray-950">
      {/* Header */}
      <div
        className="sticky top-0 z-40 border-b border-gray-800/60 bg-gray-950/90 backdrop-blur-sm"
        style={{ borderBottomColor: lang.color + '44' }}
      >
        <div className="mx-auto flex max-w-[430px] items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-700 text-gray-400 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 truncate">{lang.name} · {lesson.unit.title}</p>
            <h1 className="text-sm font-bold text-white truncate">{lesson.title}</h1>
          </div>
          <span
            className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold"
            style={{ background: typeColor + '22', color: typeColor }}
          >
            {typeLabel}
          </span>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[430px] flex-1 px-4 pb-8 pt-4">
        {phase === 'done' && !showAnim ? (
          <div className="flex flex-col items-center gap-4 pt-8 text-center">
            <CheckCircle2 size={56} className="text-green-400" />
            <h2 className="text-xl font-bold text-white">Already Completed!</h2>
            <p className="text-sm text-gray-400">You&apos;ve already finished this lesson.</p>
            <button
              onClick={() => router.push('/learn')}
              className="mt-4 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-500"
            >
              Back to Map
            </button>
            {type === 'challenge' && (
              <button
                onClick={() => setPhase('content')}
                className="rounded-xl border border-gray-700 px-6 py-3 text-sm font-medium text-gray-300 hover:border-gray-500"
              >
                Practice Again
              </button>
            )}
          </div>
        ) : (
          <>
            {type === 'lesson' && (
              <LessonCards
                cards={(content as LessonContent).cards}
                onComplete={() => handleComplete()}
              />
            )}
            {type === 'quiz' && (
              <QuizCard
                questions={(content as QuizContent).questions}
                onComplete={(score) => handleComplete(score)}
              />
            )}
            {type === 'challenge' && (
              <CodeEditor
                challenge={content as ChallengeContent}
                onComplete={(score) => handleComplete(score)}
                lessonContext={{
                  language: lang.name,
                  unit: lesson.unit.title,
                  title: lesson.title,
                }}
              />
            )}
            {type === 'review' && (
              <>
                <div className="mb-4 rounded-xl border border-purple-800/30 bg-purple-950/20 p-4">
                  <h3 className="text-sm font-bold text-purple-300 mb-2">📋 Unit Summary</h3>
                  <p className="text-sm text-gray-300">{(content as ReviewContent).summary}</p>
                  <ul className="mt-3 space-y-1.5">
                    {(content as ReviewContent).keyPoints.map((kp, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                        <span className="text-purple-400 shrink-0">•</span>
                        {kp}
                      </li>
                    ))}
                  </ul>
                </div>
                <QuizCard
                  questions={(content as ReviewContent).questions}
                  onComplete={(score) => handleComplete(score)}
                />
              </>
            )}
          </>
        )}
      </main>

      <ChatBot
        language={lang.name}
        unit={lesson.unit.title}
        lessonTitle={lesson.title}
        lessonType={type}
      />

      <CompletionAnimation
        show={showAnim}
        xpGained={xpGained}
        coinsGained={coinsGained}
        title={lesson.title}
        onDismiss={handleAnimDismiss}
      />
    </div>
  );
}
