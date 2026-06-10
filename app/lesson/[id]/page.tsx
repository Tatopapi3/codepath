import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import LessonClient from './LessonClient';

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  // Fetch lesson with unit + language
  const { data: lesson } = await supabase
    .from('lessons')
    .select('*, unit:units(*, language:languages(*))')
    .eq('id', id)
    .single();

  if (!lesson) notFound();

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  // Check if already completed
  const { data: existing } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('lesson_id', id)
    .single();

  return (
    <LessonClient
      lesson={lesson}
      userId={user.id}
      profile={profile}
      alreadyCompleted={existing?.completed ?? false}
    />
  );
}
