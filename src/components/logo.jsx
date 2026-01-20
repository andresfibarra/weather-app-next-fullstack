'use client';

import { cn } from '@/lib/utils';

/**
 * Logo component with icon mark and optional wordmark.
 * Follows the design system: sky-400 accent, white/opacity text, subtle containers.
 */
function Logo({ showWordmark = true, size = 'default', className }) {
  const sizes = {
    sm: {
      container: 'h-7 w-7 rounded-md',
      icon: 'h-3.5 w-3.5',
      text: 'text-xs',
    },
    default: {
      container: 'h-8 w-8 rounded-lg',
      icon: 'h-4 w-4',
      text: 'text-sm',
    },
    lg: {
      container: 'h-10 w-10 rounded-lg',
      icon: 'h-5 w-5',
      text: 'text-base',
    },
  };

  const s = sizes[size] || sizes.default;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Icon mark */}
      <div
        className={cn(
          'flex items-center justify-center',
          'bg-white/[0.05] ring-1 ring-white/[0.08]',
          s.container
        )}
      >
        <svg
          className={cn('text-sky-400', s.icon)}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z"
          />
        </svg>
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <span className={cn('font-semibold tracking-tight text-white/80', s.text)}>
          Weather
        </span>
      )}
    </div>
  );
}

export default Logo;
