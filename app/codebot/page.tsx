import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TutorScreen from '@/components/tutor/TutorScreen';
import BottomNav from '@/components/ui/BottomNav';

export default async function CodeBotPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  return (
    <div className="flex h-screen flex-col bg-gray-950">
      <TutorScreen />
      <BottomNav />
    </div>
  );
}
