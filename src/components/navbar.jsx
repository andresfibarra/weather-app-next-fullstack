'use client';

import React from 'react';
import Logo from './logo';
import { Button } from '@/components/ui/button';

function NavBar() {
  return (
    <header className="fixed top-0 left-0 w-full h-16 px-8 flex items-center justify-between border-b border-slate-800 backdrop-blur z-50">
      <Logo />
      <form action="/auth/signout" method="post">
        <Button variant="ghost">Sign Out</Button>
      </form>
    </header>
  );
}

export default NavBar;
