// src/app/api/locations/[id]/route.js

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const debug = false;

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
 * Request Body: none
 *
 * // Success Response (200)
 * {
 *   success: true,
 *   message: 'Location removed successfully',
 *   deletedLocationId: 123,
 * }
 *
 * // Error Response (404)
 * {
 *   success: false,
 *   error: 'Location not found in database',
 *   message: '...',
 * }
 *
 * // Error Response (500)
 * {
 *   success: false,
 *   error: [Error message],
 *   message: '...',
 * }
 *
 * // Error Response (400)
 * {
 *   success: false,
 *   error: 'Unable to complete delete operation',
 *   message: 'User ID is required for delete',
 * }
 *
 * // Error Response (401)
 * {
 *   success: false,
 *   error: 'User is not authenticated',
 *   message: '...',
 * }
 */
export async function DELETE(request, { params }) {
  if (debug) console.log('DELETE /api/locations/[id] received');

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (!user || authError) {
    console.error(
      'Error getting authenticated user when calling DELETE /api/locations/[id]:',
      authError,
    );
    return NextResponse.json(
      { success: false, error: 'User is not authenticated', message: authError.message },
      { status: 401 },
    );
  }

  const userId = user.id;

  // 1. Extract location_id from URL params ([id]) and user_id from request
  const { id } = await params;
  if (debug) {
    console.log('locationId:', id);
  }

  // 2. validate userId
  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to complete delete operation',
        message: 'User ID is required for delete',
      },
      { status: 400 },
    );
  }

  // 3. Fetch record to be deleted to get its current display_order
  const { data: record, error: recordError } = await supabase
    .from('user_saved_locations')
    .select('display_order')
    .eq('user_id', userId)
    .eq('id', id)
    .maybeSingle(); // Only 1 row should exist

  if (recordError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Error fetching record to be deleted',
        message: recordError.message,
      },
      { status: 500 },
    );
  }

  if (!record) {
    return NextResponse.json(
      { success: false, error: 'Location not found in database' },
      { status: 404 },
    );
  }

  const display_order = record.display_order;
  if (debug) console.log('display_order:', display_order);

  // 4. Delete record from user_saved_locations
  const { data: deleteResult, error: deleteError } = await supabase
    .from('user_saved_locations')
    .delete()
    .eq('user_id', userId)
    .eq('id', id);
  console.log('deleteResult:', deleteResult);

  if (deleteError) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete location', message: deleteError.message },
      { status: 500 },
    );
  }

  // 5. Reorder remaining locations in database
  const { data: reorderData, error: reorderError } = await supabase.rpc('decrement_display_order', {
    uid: userId,
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
