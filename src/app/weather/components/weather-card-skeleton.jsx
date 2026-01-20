'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function WeatherCardSkeleton() {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/[0.08] p-6',
        'bg-gradient-to-b from-white/[0.04] to-transparent'
      )}
    >
      {/* Location */}
      <div className="mb-4">
        <Skeleton className="h-7 w-32 bg-white/[0.06]" />
        <Skeleton className="mt-2 h-4 w-20 bg-white/[0.04]" />
      </div>

      {/* Temperature */}
      <div className="mb-4">
        <Skeleton className="h-12 w-24 bg-white/[0.06]" />
      </div>

      {/* Details */}
      <div className="flex gap-6">
        <Skeleton className="h-4 w-16 bg-white/[0.04]" />
        <Skeleton className="h-4 w-24 bg-white/[0.04]" />
      </div>
    </div>
  );
}
