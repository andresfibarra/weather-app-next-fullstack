'use client';

import React from 'react';
import Logo from './logo';

function NavBar() {
  return (
    <header className="fixed top-0 left-0 w-full h-16 px-8 flex items-center justify-between border-b border-slate-800 backdrop-blur z-50">
      <Logo />

      <nav className="flex gap-3">
        <div>Thing 1</div>
        <div>Thing 2</div>
      </nav>
    </header>
  );
}

export default NavBar;
