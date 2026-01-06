'use client';

import React from 'react';
import Logo from './logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/utils/hooks/useAuth';

function NavBar() {
  const { isAuthed } = useAuth();

  return (
    <header className="fixed top-0 left-0 w-full h-16 px-8 flex items-center justify-between border-b border-slate-800 backdrop-blur z-50">
      <Link href="/">
        <Button variant="ghost" className="p-0 h-auto">
          <Logo />
        </Button>
      </Link>
      {isAuthed ? (
        <div className="flex items-center gap-2">
          <Link href="/weather">
            <Button variant="ghost">Weather</Button>
          </Link>
          <form action="/auth/signout" method="post">
            <Button variant="ghost">Sign Out</Button>
          </form>
        </div>
      ) : (
        <Link href="/login">
          <Button variant="ghost">Sign In</Button>
        </Link>
      )}
    </header>
  );
}

export default NavBar;
