'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/utils/hooks/useAuth';
import { cn } from '@/lib/utils';

// Minimal nav link component with understated hover
function NavLink({ href, children, className }) {
  return (
    <Link
      href={href}
      className={cn(
        'px-3 py-1.5 text-sm font-medium text-white/50',
        'transition-colors duration-300 ease-out',
        'hover:text-white/90',
        className
      )}
    >
      {children}
    </Link>
  );
}

// Sign out button styled as nav link
function SignOutButton() {
  return (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className={cn(
          'px-3 py-1.5 text-sm font-medium text-white/50',
          'transition-colors duration-300 ease-out',
          'hover:text-white/90',
          'cursor-pointer'
        )}
      >
        Sign out
      </button>
    </form>
  );
}

function NavBar() {
  const { isAuthed } = useAuth();

  return (
    <header
      className={cn(
        'fixed top-0 left-0 z-50 w-full',
        'h-16 px-8',
        'flex items-center justify-between',
        // Subtle background with blur
        'bg-white/[0.02] backdrop-blur-md',
        // Nearly invisible border
        'border-b border-white/[0.06]'
      )}
    >
      {/* Logo */}
      <Link href="/" className="group flex items-center gap-2">
        {/* Icon mark */}
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            'bg-white/[0.05] ring-1 ring-white/[0.08]',
            'transition-all duration-300 ease-out',
            'group-hover:bg-white/[0.08] group-hover:ring-white/[0.12]'
          )}
        >
          <svg
            className="h-4 w-4 text-sky-400"
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
        <span
          className={cn(
            'text-sm font-semibold tracking-tight text-white/80',
            'transition-colors duration-300 ease-out',
            'group-hover:text-white'
          )}
        >
          Weather
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex items-center gap-1">
        {isAuthed ? (
          <>
            <NavLink href="/weather">Dashboard</NavLink>
            <div className="mx-2 h-4 w-px bg-white/[0.08]" />
            <SignOutButton />
          </>
        ) : (
          <NavLink href="/login" className="text-white/70 hover:text-white">
            Sign in
          </NavLink>
        )}
      </nav>
    </header>
  );
}

export default NavBar;
