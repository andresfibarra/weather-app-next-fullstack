// src/app/api/locations/route.js

import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';

const debug = true;

// GET request to fetch all locations from the database
export async function GET(request) {
  const { data, error } = await supabase.from('user_saved_locations').select('*');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 200 });
}

// POST request to add a new location to the database
export async function POST(request) {
  if (debug) console.log('POST request received');
  // get body data
  const res = await request.json();
  if (debug) console.log('And here is res', res);

  // check if location exists in table
  let { data: locationData, error: locationError } = await supabase
    .from('locations')
    .select('*')
    .eq('location', res.location)
    .eq('state_code', res.state_code)
    .eq('country_code', res.country_code)
    .maybeSingle();

  if (locationError) {
    return NextResponse.json({ error: locationError.message }, { status: 500 });
  }
  if (debug) console.log(`Here is locationData`, locationData); // should be zero for now

  // if doesn't exist, create
  if (locationData.length === 0) {
    if (debug) console.log(`Location does not exist, creating...`);
    ({ data: locationData, error: locationError } = await supabase
      .from('locations')
      .insert({
        location: res.location,
        state_code: res.state_code,
        country_code: res.country_code,
        timezone_abbreviation: res.timezone_abbreviation,
        latitude: res.latitude,
        longitude: res.longitude,
      })
      .select()
      .maybeSingle());

    if (locationError) {
      return NextResponse.json({ error: locationError.message }, { status: 500 });
    }
  }
  if (debug) console.log(`Here is locationData`, locationData);
  console.log(`locationData.id`, locationData.id);

  // check for duplicates in user_saved_locations
  const { data: userSavedLocationsData, error: userSavedLocationsError } = await supabase
    .from('user_saved_locations')
    .select('*, locations(state_code, country_code)')
    .eq('user_id', `550e8400-e29b-41d4-a716-446655440000`)
    .eq('location_id', locationData.id)
    .eq('locations.state_code', locationData.state_code)
    .eq('locations.country_code', locationData.country_code)
    .maybeSingle();

  if (debug) console.log(`Here is userSavedLocationsData`, userSavedLocationsData);

  // add to user_saved locations if not a duplicated
  if (!userSavedLocationsData) {
    const { data, error } = await supabase
      .from('user_saved_locations')
      .insert({
        user_id: `550e8400-e29b-41d4-a716-446655440000`,
        location_id: locationData.id,
      })
      .select()
      .single();

    if (debug) console.log(`Here is data inserted to user locations`, data);

    if (error) {
      if (debug) console.log(`Here is error`, error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      );
    }

    console.log(`data`, data);

    return NextResponse.json(
      {
        success: true,
        locationId: locationData.id,
        message: 'Location saved successfully',
      },
      {
        status: 200,
      },
    );
  }
  // if location already exists in user locations
  if (debug) console.log(`Location already exists in user locations`);

  return NextResponse.json(
    {
      success: false,
      error: 'Location already exists in user locations',
      locationId: locationData.id,
    },
    {
      status: 409,
    },
  );
}
/*
1. check if location exists in table
2. if not, create
3. add to user_saved_locations
4. handle duplicate check (same user and location)
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
