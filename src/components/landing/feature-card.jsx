'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

export function FeatureCard({
  href,
  title,
  description,
  icon: Icon,
  badge,
  disabled = false,
  className,
}) {
  const content = (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-transparent p-8',
        'transition-all duration-500 ease-out',
        !disabled && 'hover:border-white/[0.15] hover:from-white/[0.08] hover:shadow-[0_0_40px_-12px_rgba(255,255,255,0.1)]',
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
    >
      {/* Subtle gradient glow on hover */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sky-500/[0.05] to-indigo-500/[0.05] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Icon */}
      {Icon && (
        <div className="mb-6 inline-flex rounded-xl bg-white/[0.05] p-3 ring-1 ring-white/[0.08]">
          <Icon className="h-6 w-6 text-sky-400" />
        </div>
      )}

      {/* Badge */}
      {badge && (
        <span className="absolute right-6 top-6 rounded-full bg-white/[0.08] px-3 py-1 text-xs font-medium text-white/60">
          {badge}
        </span>
      )}

      {/* Content */}
      <h3 className="mb-2 text-xl font-semibold tracking-tight text-white">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-white/50">
        {description}
      </p>

      {/* Arrow indicator */}
      {!disabled && (
        <div className="mt-6 flex items-center text-sm font-medium text-sky-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span>Explore</span>
          <svg
            className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      )}
    </div>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
