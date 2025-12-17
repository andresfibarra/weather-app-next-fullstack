// src/app/api/locations/reorder/route.js

import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';
import useStore from '@/store/useWeatherStore';

const debug = true;
const HARDCODED_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

/**
 * POST /api/locations/reorder
 *
 * Reorders the locations for the hardcoded user ID
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
 *   "message": "..."
 * }
 *
 * // Error Response (400))
 * {
 *   "success": false,
 *   "message": "Invalid request body: Missing required fields"
 * }
 */
export async function POST(request) {
  const getCityWeatherById = useStore.getState().getCityWeatherById;

  try {
    // 1. Validate request body
    const { movedId, targetId } = await request.json();

    if (!movedId || !targetId) {
      return NextResponse.json(
        { success: false, message: 'Invalid request body: Missing required fields' },
        { status: 400 },
      );
    }

    // 2. Call rpc to reorder the locations
    const { data: reorderData, error: reorderError } = await supabase.rpc(
      'reorder_user_locations',
      {
        p_user_id: HARDCODED_USER_ID,
        p_moved_id: movedId,
        p_target_id: targetId,
      },
    );

    if (debug) console.log('Reorder result:', reorderData);

    if (reorderError) {
      console.error('Error reordering in database:', reorderError.message);
      return NextResponse.json({ success: false, error: reorderError.message }, { status: 500 });
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
        error: err.message || 'Internal server error',
      },
      { status: 500 },
    );
  }
}
