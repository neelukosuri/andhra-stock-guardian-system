
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bell, Search, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AppHeaderProps {
  userRole: 'HQ_ADMIN' | 'DISTRICT_ADMIN';
}

const AppHeader: React.FC<AppHeaderProps> = ({ userRole }) => {
  return (
    <header className="h-16 flex items-center justify-between border-b border-apGray-200 bg-white px-4 animate-fade-in">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="h-9 w-9 rounded-full hover:bg-apGray-100 flex items-center justify-center transition-colors" />
        <h1 className="text-lg font-semibold text-apBlue-700">AP Police Communications</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <button className="h-9 w-9 rounded-full hover:bg-apGray-100 flex items-center justify-center transition-colors">
            <Bell className="h-5 w-5 text-apGray-700" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-apBlue-600" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Avatar className="h-9 w-9 bg-apBlue-600">
            <AvatarFallback className="bg-apBlue-600 text-white">
              A
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-right">
            <span className="text-sm font-medium">Admin User</span>
            <span className="text-xs text-apGray-600">Admin</span>
          </div>
          <ChevronDown className="h-4 w-4 text-apGray-500" />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
