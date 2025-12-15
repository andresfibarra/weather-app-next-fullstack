// src/app/api/locations/route.js

import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';

const debug = true;
const HARDCODED_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

/**
 * GET /api/locations
 *
 * Fetches all locations for the hardcoded user ID
 *
 * @param request - The incoming HTTP request
 * @returns - JSON response containing array of user_saved_locations
 *
 * @example
 * Request Body: None
 *
 * GET /api/locations
 *
 * // Success Response (200)
 * [
 * {
 *   id: "...",
 *   user_id: "...",
 *   location_id: "...", // foreign key to locations table
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
  const { data: selectData, error: selectError } = await supabase
    .from('user_saved_locations')
    .select('*')
    .eq('user_id', HARDCODED_USER_ID);
  if (selectError) {
    return NextResponse.json({ error: selectError.message }, { status: 500 });
  }
  return NextResponse.json(selectData, { status: 200 });
}

/**
 * POST /api/locations
 *
 * Adds a new location to the user's saved locations
 *
 * Flow:
 * 1. Check if location exists in locations table, creates if not
 * 2. Check if location is already saved by the user
 * 3. Calculate next display_order for the user
 * 4. Insert into user_saved_locations with the new display_order
 * 5. Return success response
 *
 * @param request - HTTP request containing location data
 * @param request.body - Request body
 * @param request.body.userId - user ID of the user saving the location
 * @param request.body.location - Location name
 * @param request.body.state_code - State code
 * @param request.body.country_code - Country code
 * @param request.body.timezone_abbreviation - Timezone abbreviation
 * @param request.body.latitude - Latitude
 * @param request.body.longitude - Longitude
 *
 * @returns - JSON response containing success, locationId, displayOrder, message
 *
 * @example
 * Request Body:
 * {
 *   userId: "...",
 *   location: "New York",
 *   state_code: "NY",
 *   country_code: "US",
 *   timezone_abbreviation: "EST",
 *   latitude: 40.7128,
 *   longitude: -74.0060
 * }
 *
 * // Success Response (200)
 * {
 *   success: true,
 *   locationId: "...", // user_saved_locations.id
 *   displayOrder: ...,
 *   message: "Location saved successfully"
 * }
 *
 * // Error Response (500)
 * {
 *   success: false,
 *   error: "Error message"
 * }
 *
 * // Error Response (409)
 * {
 *   success: false,
 *   error: "Location already exists in user locations",
 *   locationId: "...", // user_saved_locations.id
 *   displayOrder: ...
 * }
 *
 * // Error Response (400)
 * {
 *   success: false,
 *   error: "Invalid request body",
 *   message: "Missing required fields"
 * }
 */
export async function POST(request) {
  if (debug) console.log('POST /api/locations received');

  // get body data
  const res = await request.json();
  if (debug) console.log('Response body:', res);

  const { userId, location, state_code, country_code, timezone_abbreviation, latitude, longitude } =
    res;

  if (
    !userId || // remove once authentication is implemented
    !location ||
    !state_code ||
    !country_code ||
    !timezone_abbreviation ||
    !latitude ||
    !longitude
  ) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid request body',
        message: 'Missing required fields',
      },
      { status: 400 },
    );
  }

  // 1a. Check  locations table
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

  // 1b. If location doesn't exist, create
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

    console.log('locationError:', locationError);
    if (locationError || !locationData) {
      if (debug) console.error('error end of step 2');
      return NextResponse.json({ error: locationError.message }, { status: 500 });
    }
  }

  if (debug) console.log(`Final locationData`, locationData);

  // 2. check for duplicates in user_saved_locations
  const { data: userSavedLocationsData, error: userSavedLocationsError } = await supabase
    .from('user_saved_locations')
    .select('*')
    .eq('user_id', userId)
    .eq('location_id', locationData.id)
    .maybeSingle();

  if (userSavedLocationsError) {
    return NextResponse.json(
      { success: false, error: userSavedLocationsError.message },
      { status: 500 },
    );
  }

  // 2b. If already saved, return duplicate response
  if (userSavedLocationsData) {
    if (debug) console.log(`Location already exists in user locations`);
    return NextResponse.json(
      {
        success: false,
        error: 'Location already exists in user locations',
        locationId: userSavedLocationsData.id,
        displayOrder: userSavedLocationsData.display_order,
      },
      {
        status: 409,
      },
    );
  }

  // 3a. Get the maximum display_order for this user
  const { data: maxDisplayOrderData, error: maxDisplayOrderError } = await supabase
    .from('user_saved_locations')
    .select('display_order')
    .eq('user_id', userId)
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

  // 3b.Calculate the next display_order
  // If no entries exist, maxOrderData will be null, so use 1
  // Otherwise, use max + 1
  const nextDisplayOrder = maxDisplayOrderData?.display_order
    ? maxDisplayOrderData.display_order + 1
    : 1;
  if (debug) console.log(`Next display_order: ${nextDisplayOrder}`);

  // 4. Insert into to user_saved locations if not a duplicate
  const { data: insertUserLocation, error: insertUserLocationError } = await supabase
    .from('user_saved_locations')
    .insert({
      user_id: userId,
      location_id: locationData.id, // for debugging purposes
      display_order: nextDisplayOrder,
    })
    .select('id, location_id, display_order')
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

  // 5. Return success response
  return NextResponse.json(
    {
      success: true,
      locationId: insertUserLocation.id,
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
