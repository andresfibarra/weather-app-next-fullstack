// src/app/api/locations/route.js

import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';

// GET request to fetch all locations from the database
export async function GET(request) {
  const { data, error } = await supabase.from('locations').select('*');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 200 });
}

// POST request to add a new location to the database
/*
1. check if location exists in table
2. if not, create
3. add to user_saved_locations
4. handle duplicate check (same user and location)
*/

// DELETE request to delete a location from the user's saved lists
// in /api/locations/[id]/route.js
/*
1. Remove from user_saved_locations
*/

// POST request /api/locations/[id]/reorder --> reorder saved locations
/*
Body: {userId, displayOrder }
Returns: {success: true }
*/

// export async function GET() {
//   console.log('GET request received');
//   return NextResponse.json({ ok: true });
// }
