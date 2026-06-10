'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/ui/Header';
import BottomNav from '@/components/ui/BottomNav';
import LearningPath from '@/components/map/LearningPath';
import ChatBot from '@/components/tutor/ChatBot';
import { useUserStore } from '@/stores/userStore';
import type { Language, Unit, Lesson, UserProgress, UserProfile } from '@/lib/content/types';

interface LearnClientProps {
  languages: Language[];
  initialProfile: UserProfile | null;
  initialLanguageSlug: string;
}

export default function LearnClient({ languages, initialProfile, initialLanguageSlug }: LearnClientProps) {
  const setUser = useUserStore((s) => s.setUser);
  const [activeSlug, setActiveSlug] = useState(initialLanguageSlug);
  const [units, setUnits] = useState<(Unit & { lessons: Lesson[] })[]>([]);
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [loadingPath, setLoadingPath] = useState(true);

  // Bootstrap user store
  useEffect(() => {
    if (initialProfile) setUser(initialProfile);
  }, [initialProfile, setUser]);

  // Load units + progress when language changes
  useEffect(() => {
    const lang = languages.find((l) => l.slug === activeSlug);
    if (!lang) return;

    setLoadingPath(true);
    const supabase = createClient();

    async function loadPath() {
      const lang = languages.find((l) => l.slug === activeSlug);
      if (!lang) return;

      const { data: unitsData } = await supabase
        .from('units')
        .select('*, lessons(*)')
        .eq('language_id', lang.id)
        .order('display_order');

      // Sort lessons within each unit
      const sortedUnits = (unitsData ?? []).map((u) => ({
        ...u,
        lessons: (u.lessons as Lesson[]).sort((a, b) => a.display_order - b.display_order),
      }));

      setUnits(sortedUnits);

      // Load progress
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const allLessonIds = sortedUnits.flatMap((u) => u.lessons.map((l: Lesson) => l.id));
        if (allLessonIds.length > 0) {
          const { data: progressData } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .in('lesson_id', allLessonIds);

          const map: Record<string, UserProgress> = {};
          (progressData ?? []).forEach((p: UserProgress) => { map[p.lesson_id] = p; });
          setProgress(map);
        }
      }

      setLoadingPath(false);
    }

    loadPath();
  }, [activeSlug, languages]);

  const activeLanguage = languages.find((l) => l.slug === activeSlug);

  return (
    <div className="flex min-h-screen flex-col bg-gray-950">
      <Header />

      {/* Language tabs */}
      <div className="sticky top-[57px] z-30 border-b border-gray-800/60 bg-gray-950/90 backdrop-blur-sm">
        <div className="mx-auto max-w-[430px] overflow-x-auto">
          <div className="flex items-center gap-1 px-4 py-2" style={{ minWidth: 'max-content' }}>
            {languages.map((lang) => (
              <button
                key={lang.slug}
                onClick={() => setActiveSlug(lang.slug)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-blue-500 ${
                  activeSlug === lang.slug
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                style={activeSlug === lang.slug ? { background: lang.color + '33', color: lang.color } : {}}
              >
                <span>{lang.icon}</span>
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Learning path */}
      <main className="mx-auto w-full max-w-[430px] flex-1 overflow-y-auto px-4 pb-24 pt-4">
        {loadingPath ? (
          <div className="flex flex-col gap-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-gray-800/50" />
            ))}
          </div>
        ) : activeLanguage && units.length > 0 ? (
          <LearningPath language={activeLanguage} units={units} progress={progress} />
        ) : (
          <div className="flex flex-col items-center justify-center pt-20 text-center gap-3">
            <span className="text-4xl">🚧</span>
            <p className="text-gray-400 text-sm">Curriculum coming soon!</p>
          </div>
        )}
      </main>

      <ChatBot
        language={activeLanguage?.name}
        unit="Learning Map"
        lessonTitle="Browsing Courses"
        lessonType="lesson"
      />
      <BottomNav />
    </div>
  );
}
