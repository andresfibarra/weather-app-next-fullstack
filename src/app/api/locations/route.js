// src/app/api/locations/route.js

import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';

export async function GET(request) {
  const { data, error } = await supabase.from('locations').select('*');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 200 });
}

// export async function GET() {
//   console.log('GET request received');
//   return NextResponse.json({ ok: true });
// }
