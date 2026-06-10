import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CoursesClient from './CoursesClient';

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: languages } = await supabase
    .from('languages')
    .select('*, units(count)')
    .order('display_order');

  const { data: progressData } = await supabase
    .from('user_progress')
    .select('lesson_id, completed')
    .eq('user_id', user.id)
    .eq('completed', true);

  const completedIds = new Set((progressData ?? []).map((p) => p.lesson_id));

  return <CoursesClient languages={languages ?? []} completedLessonIds={completedIds} />;
}
