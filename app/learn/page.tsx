import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LearnClient from './LearnClient';

export default async function LearnPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  // Fetch languages
  const { data: languages } = await supabase
    .from('languages')
    .select('*')
    .order('display_order');

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  // Get user's last active language (default to first)
  const activeLanguage = languages?.[0] ?? null;

  return (
    <LearnClient
      languages={languages ?? []}
      initialProfile={profile}
      initialLanguageSlug={activeLanguage?.slug ?? 'python'}
    />
  );
}
