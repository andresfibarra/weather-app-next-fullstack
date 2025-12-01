// src/app/api/locations/[id]/route.js

import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';

const debug = true;

// DELETE request to delete a location from the user's saved lists
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
    .eq('location_id', id)
    .maybeSingle(); // Only 1 row should exist

  if (!record) {
    return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
  }

  if (recordError) {
    return NextResponse.json({ success: false, error: recordError.message }, { status: 500 });
  }

  const display_order = record.display_order;
  if (debug) console.log('display_order:', display_order);

  // 4. Delete record from user_saved_locations
  const { error } = await supabase
    .from('user_saved_locations')
    .delete()
    .eq('user_id', user_id)
    .eq('location_id', id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  // 5. Reorder remaining locations

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
