'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { UserProgress } from '@/lib/content/types';

export function useProgress(userId: string | null) {
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setProgress({});
      setLoading(false);
      return;
    }

    const supabase = createClient();

    async function loadProgress() {
      const { data } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      const map: Record<string, UserProgress> = {};
      (data ?? []).forEach((p: UserProgress) => {
        map[p.lesson_id] = p;
      });
      setProgress(map);
      setLoading(false);
    }

    loadProgress();
  }, [userId]);

  const completeLesson = async (
    lessonId: string,
    score?: number
  ): Promise<void> => {
    if (!userId) return;
    const supabase = createClient();

    const { data } = await supabase
      .from('user_progress')
      .upsert(
        {
          user_id: userId,
          lesson_id: lessonId,
          completed: true,
          score: score ?? null,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,lesson_id' }
      )
      .select()
      .single();

    if (data) {
      setProgress((prev) => ({ ...prev, [lessonId]: data }));
    }
  };

  return { progress, loading, completeLesson };
}
