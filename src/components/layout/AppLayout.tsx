
import React from 'react';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

const AppLayout = ({ children, onLogout }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader onLogout={onLogout} />
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
