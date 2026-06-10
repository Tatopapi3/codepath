import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ActivityClient from './ActivityClient';

export default async function ActivityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  // Last 30 days of completions
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recentProgress } = await supabase
    .from('user_progress')
    .select('*, lesson:lessons(title, type, unit:units(title, language:languages(name, color)))')
    .eq('user_id', user.id)
    .eq('completed', true)
    .gte('completed_at', thirtyDaysAgo.toISOString())
    .order('completed_at', { ascending: false });

  return <ActivityClient profile={profile} recentProgress={recentProgress ?? []} />;
}
