import React from 'react';
import Sidebar from './Sidebar';
import Navigation from './Navigation';
// import WelcomeModal from './WelcomeModal';
import { useRealtime } from '@/hooks/useRealtime';
import Header from './Header';
import ModalProvider from './ModalProvider';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  useRealtime();

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="md:ml-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow p-4 pb-20 md:pb-4">
          {children}
        </main>
      </div>
      <Navigation />
      {/* <WelcomeModal /> */}
      <ModalProvider />
    </div>
  );
};

export default Layout;
