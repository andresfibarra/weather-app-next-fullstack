import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function WeatherLayout({ children }) {
  const supabase = await createClient();

  // check for authenticated user to access weather page
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (!user || authError) {
    console.error('Error getting authenticated user when calling WeatherLayout:', authError);
    redirect('/login');
  }

  return <>{children}</>;
}
