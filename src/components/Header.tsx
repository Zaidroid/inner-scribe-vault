import React from 'react';
import { GlobalSearch } from './GlobalSearch';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';

const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-card/60 backdrop-blur-lg border-b border-white/10 md:justify-end dark:bg-transparent dark:backdrop-blur-none dark:border-transparent">
      <div className="md:hidden">
        {/* Mobile-specific header elements can go here, like a logo or menu toggle */}
      </div>
      <div className="w-full max-w-md">
        <GlobalSearch />
      </div>
    </header>
  );
};

export default Header; 