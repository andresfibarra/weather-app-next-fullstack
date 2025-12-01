// src/app/api/locations/[id]/route.js

import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';

// DELETE request to delete a location from the user's saved lists
export async function DELETE(request, { params }) {
  console.log('DELETE /api/locations/[id] received');
  const { id } = await params;

  console.log('locationId:', id);
  const { user_id } = await request.json();

  if (!user_id) {
    return NextResponse.json(
      {
        success: false,
        error: 'User ID is required',
      },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from('user_saved_locations')
    .delete()
    .eq('user_id', user_id)
    .eq('location_id', id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      success: true,
      message: 'Location removed successfully',
      deletedLocationId: id,
    },
    { status: 200 },
  );
}
