import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function WeatherLayout({ children }) {
  return <>{children}</>;
}
