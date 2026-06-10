import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const [{ data: profile }, { data: achievementsData }, { data: userAchievements }, { count: completedCount }] =
    await Promise.all([
      supabase.from('users').select('*').eq('id', user.id).single(),
      supabase.from('achievements').select('*').order('xp_required'),
      supabase.from('user_achievements').select('*, achievement:achievements(*)').eq('user_id', user.id),
      supabase.from('user_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('completed', true),
    ]);

  const earnedIds = new Set((userAchievements ?? []).map((ua) => ua.achievement_id));

  return (
    <ProfileClient
      profile={profile}
      achievements={achievementsData ?? []}
      earnedIds={earnedIds}
      completedLessons={completedCount ?? 0}
    />
  );
}
