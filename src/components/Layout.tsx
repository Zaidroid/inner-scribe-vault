
import React from 'react';
import Sidebar from './Sidebar';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="md:ml-64 min-h-screen">
        <div className="p-4 pb-20 md:pb-4">
          {children}
        </div>
      </main>
      <Navigation />
    </div>
  );
};

export default Layout;
