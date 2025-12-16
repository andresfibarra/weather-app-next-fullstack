// src/app/api/locations/[id]/route.js

import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';

const debug = true;

/**
 * DELETE /api/locations/[id]
 *
 * Deletes a location from the user's saved locations by location_id
 * Automatically reorders remaining locations to keep display_order sequential
 *
 * Process:
 * 1. Extract location_id from URL params ([id]) and user_id from request
 * 2. Validate user_id
 * 3. Fetch record to be deleted to get its current display_order
 * 4. Delete record from user_saved_locations
 * 5. Reorder remaining locations
 * 6. return success response
 *
 * @param request - HTTP request
 * @param params - route parameters
 * @param params.id - Location ID to delete
 * @param request.body - Request body
 * @param request.body.user_id - user ID of the user deleting the location
 *
 * @returns - JSON response containing success status and message
 *
 * @example
 * // Request
 * DELETE /api/locations/123
 * Request Body:
 * {
 *   user_id: "...",
 * }
 *
 * // Success Response (200)
 * {
 *   success: true,
 * message: 'Location removed successfully',
 * deletedLocationId: 123,
 * }
 *
 * // Error Response (404)
 * {
 *   success: false,
 *   error: 'Location not found in database',
 * }
 *
 * // Error Response (500)
 * {
 *   success: false,
 *   error: 'Error message',
 * }
 *
 * // Error Response (400)
 * {
 *   success: false,
 *   error: 'User ID is required',
 * }
 */
export async function DELETE(request, { params }) {
  if (debug) console.log('DELETE /api/locations/[id] received');
  // 1. Extract location_id from URL params ([id]) and user_id from request
  const { id } = await params;
  const { user_id } = await request.json();
  if (debug) {
    console.log('locationId:', id);
    console.log('user_id:', user_id);
  }

  // 2. validate user_id
  if (!user_id) {
    return NextResponse.json(
      {
        success: false,
        error: 'User ID is required',
      },
      { status: 400 },
    );
  }

  // 3. Fetch record to be deleted to get its current display_order
  const { data: record, error: recordError } = await supabase
    .from('user_saved_locations')
    .select('display_order')
    .eq('user_id', user_id)
    .eq('id', id)
    .maybeSingle(); // Only 1 row should exist

  if (!record) {
    return NextResponse.json(
      { success: false, error: 'Location not found in database' },
      { status: 404 },
    );
  }

  if (recordError) {
    return NextResponse.json(
      {
        success: false,
        error: recordError.message,
      },
      { status: 500 },
    );
  }

  const display_order = record.display_order;
  if (debug) console.log('display_order:', display_order);

  // 4. Delete record from user_saved_locations
  const { data: deleteResult, error: deleteError } = await supabase
    .from('user_saved_locations')
    .delete()
    .eq('user_id', user_id)
    .eq('id', id);
  console.log('deleteResult:', deleteResult);

  if (deleteError) {
    return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
  }

  // 5. Reorder remaining locations in database
  const { data: reorderData, error: reorderError } = await supabase.rpc('decrement_display_order', {
    uid: user_id,
    threshold: display_order,
  });

  if (debug) console.log('Reorder result:', reorderData);

  if (reorderError) {
    console.error('Error decerementing display_order:', reorderError.message);
    return NextResponse.json({ success: false, error: reorderError.message }, { status: 500 });
  }

  // 6. Return success response
  return NextResponse.json(
    {
      success: true,
      message: 'Location removed successfully',
      deletedLocationId: id,
    },
    { status: 200 },
  );
}
