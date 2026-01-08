// src/app/api/locations/reorder/route.js

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import useStore from '@/store/useWeatherStore';

const debug = false;

/**
 * POST /api/locations/reorder
 *
 * Reorders the locations for the authenticated user
 *
 * @param request - The incoming HTTP request
 * @param request.body - JSON object containing the following:
 * @param request.body.movedId - The location_id of the location that is being moved
 * @param request.body.targetId - The location_id of the location that is the target of the move
 * @returns - JSON response containing the following:
 * @returns.success - Boolean indicating if the reorder was successful
 * @returns.message - Message indicating the result of the reorder
 *
 * @example
 * Request Body:
 * {
 *   "movedId": "...",
 *   "targetId": "..."
 * }
 *
 * // Success Response (200)
 * {
 *   "success": true,
 *   "message": "Locations reordered successfully"
 * }
 *
 * // Error Response (500)
 * {
 *   "success": false,
 *   "error": 'Unable to complete reorder operation',
 *   "message": "...",
 * }
 *
 * // Error Response (400))
 * {
 *   "success": false,
 *   error: "Unable to complete reorder operation",
 *   message: "Invalid request body: Missing required fields for reorder operation"
 * }
 *
 * // Error Response (401)
 * {
 *   "success": false,
 *   error: "User is not authenticated",
 *   "message": "..."
 * }
 */
export async function POST(request) {
  const getCityWeatherById = useStore.getState().getCityWeatherById;

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (!user || authError) {
    console.error(
      'Error getting authenticated user when calling REORDER /api/locations/reorder:',
      authError,
    );
    return NextResponse.json(
      { success: false, error: 'User is not authenticated', message: authError.message },
      { status: 401 },
    ); // Unauthorized
  }

  const userId = user.id;

  try {
    // 1. Validate request body
    const { movedId, targetId } = await request.json();

    if (!movedId || !targetId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to complete reorder operation',
          message: 'Invalid request body: Missing required fields for reorder operation',
        },
        { status: 400 },
      );
    }

    // 2. Call rpc to reorder the locations
    const { data: reorderData, error: reorderError } = await supabase.rpc(
      'reorder_user_locations',
      {
        p_user_id: userId,
        p_moved_id: movedId,
        p_target_id: targetId,
      },
    );

    if (debug) console.log('Reorder result:', reorderData);

    if (reorderError) {
      console.error('Error reordering in database:', reorderError.message);
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to complete reorder operation',
          message: reorderError.message,
        },
        { status: 500 },
      );
    }

    // 3. Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Locations reordered successfully',
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('Error reordering locations:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error while reordering locations',
        message: err.message,
      },
      { status: 500 },
    );
  }
}
