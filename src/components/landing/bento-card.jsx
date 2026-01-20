'use client';

import { cn } from '@/lib/utils';

export function BentoCard({ icon: Icon, title, description, className }) {
  return (
    <div
      className={cn(
        'group relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-5',
        'transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.04]',
        className
      )}
    >
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="flex-shrink-0 rounded-lg bg-white/[0.05] p-2.5">
            <Icon className="h-5 w-5 text-white/40 transition-colors duration-300 group-hover:text-sky-400/70" />
          </div>
        )}
        <div className="min-w-0">
          <h4 className="text-sm font-medium text-white/80">{title}</h4>
          {description && (
            <p className="mt-1 text-xs leading-relaxed text-white/40">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function BentoGrid({ children, className }) {
  return (
    <div className={cn('grid gap-3', className)}>
      {children}
    </div>
  );
}
