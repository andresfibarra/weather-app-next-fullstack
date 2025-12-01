// src/app/api/locations/route.js

import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';

const debug = true;
const HARDCODED_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

// GET request to fetch all locations from the database
/**
 * GET /api/locations
 *
 * Fetches all locations for the hardcoded user ID
 *
 * @param request - The incoming HTTP request
 * @returns - JSON response containing array of user_saved_locations
 *
 * @example
 * // Request
 * GET /api/locations
 *
 * // Success Response (200)
 * [
 * {
 *   id: "...",
 *   user_id: "...",
 *   location_id: "...",
 *   display_order: 1
 *   saved_at: "2025-11-26T05:33:57.086575+00:00"
 * }]
 *
 * // Error response (500)
 * {
 *   error: "Error message"
 * }
 */
export async function GET(request) {
  const { data, error } = await supabase
    .from('user_saved_locations')
    .select('*')
    .eq('user_id', HARDCODED_USER_ID);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 200 });
}

// POST request to add a new location to the database
export async function POST(request) {
  if (debug) console.log('POST /api/locations received');

  // get body data
  const res = await request.json();
  if (debug) console.log('Response body:', res);

  const { location, state_code, country_code, timezone_abbreviation, latitude, longitude } = res;

  // 1. Find existing location (0 or 1 row)
  let { data: locationData, error: locationError } = await supabase
    .from('locations')
    .select('*')
    .eq('location', location)
    .eq('state_code', state_code)
    .eq('country_code', country_code)
    .maybeSingle();

  if (locationError) {
    return NextResponse.json({ success: false, error: locationError.message }, { status: 500 });
  }
  if (debug) console.log(`Here is locationData`, locationData); // should be zero for now

  // 2. If location doesn't exist, create
  if (!locationData) {
    if (debug) console.log(`Location does not exist, creating...`);

    ({ data: locationData, error: locationError } = await supabase
      .from('locations')
      .insert({
        location,
        state_code,
        country_code,
        timezone_abbreviation,
        latitude,
        longitude,
      })
      .select('*')
      .single());

    if (locationError || !locationData) {
      return NextResponse.json({ error: locationError.message }, { status: 500 });
    }
  }

  if (debug) console.log(`Final locationData`, locationData);

  // 3. check for duplicates in user_saved_locations
  const { data: userSavedLocationsData, error: userSavedLocationsError } = await supabase
    .from('user_saved_locations')
    .select('*')
    .eq('user_id', HARDCODED_USER_ID)
    .eq('location_id', locationData.id)
    .maybeSingle();

  if (userSavedLocationsError) {
    return NextResponse.json(
      { success: false, error: userSavedLocationsError.message },
      { status: 500 },
    );
  }

  // 4. If already saved, return duplicate response
  if (userSavedLocationsData) {
    if (debug) console.log(`Location already exists in user locations`);
    return NextResponse.json(
      {
        success: false,
        error: 'Location already exists in user locations',
        locationId: locationData.id,
        displayOrder: userSavedLocationsData.display_order,
      },
      {
        status: 409,
      },
    );
  }

  // 5a. Get the maximum display_order for this user
  const { data: maxDisplayOrderData, error: maxDisplayOrderError } = await supabase
    .from('user_saved_locations')
    .select('display_order')
    .eq('user_id', HARDCODED_USER_ID)
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maxDisplayOrderError) {
    return NextResponse.json(
      {
        success: false,
        error: maxDisplayOrderError.message,
        message: 'Failed to get max display order',
      },
      { status: 500 },
    );
  }

  // Calculate the next display_order
  // If no entries exist, maxOrderData will be null, so use 1
  // Otherwise, use max + 1
  const nextDisplayOrder = maxDisplayOrderData?.display_order
    ? maxDisplayOrderData.display_order + 1
    : 1;
  if (debug) console.log(`Next display_order: ${nextDisplayOrder}`);

  // 5b. Insert into to user_saved locations if not a duplicate
  const { data: insertUserLocation, error: insertUserLocationError } = await supabase
    .from('user_saved_locations')
    .insert({
      user_id: HARDCODED_USER_ID,
      location_id: locationData.id,
      display_order: nextDisplayOrder,
    })
    .select('location_id, display_order')
    .single();

  if (insertUserLocationError) {
    if (debug) console.error(`Error inserting into user_saved_locations`, insertUserLocationError);
    return NextResponse.json(
      {
        success: false,
        error: insertUserLocationError.message,
      },
      { status: 500 },
    );
  }

  if (debug) console.log(`Inserted user location data`, insertUserLocation);

  return NextResponse.json(
    {
      success: true,
      locationId: insertUserLocation.location_id,
      displayOrder: insertUserLocation.display_order,
      message: 'Location saved successfully',
    },
    {
      status: 200,
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
