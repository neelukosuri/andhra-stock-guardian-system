
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bell, Search } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AppHeaderProps {
  userRole: 'HQ_ADMIN' | 'DISTRICT_ADMIN';
}

const AppHeader: React.FC<AppHeaderProps> = ({ userRole }) => {
  return (
    <header className="h-16 flex items-center justify-between border-b border-apGray-200 bg-white px-4 animate-fade-in">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="h-9 w-9 rounded-full hover:bg-apGray-100 flex items-center justify-center transition-colors" />
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-apGray-500" />
          <input 
            type="search" 
            placeholder="Search..." 
            className="h-9 w-64 rounded-full border border-apGray-200 pl-9 pr-4 text-sm focus:outline-none focus:border-apBlue-400 focus:ring-1 focus:ring-apBlue-400 transition-colors" 
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <span className="text-sm font-medium">
            {userRole === 'HQ_ADMIN' ? 'HQ Administrator' : 'District Administrator'}
          </span>
        </div>
        <div className="relative">
          <button className="h-9 w-9 rounded-full hover:bg-apGray-100 flex items-center justify-center transition-colors">
            <Bell className="h-5 w-5 text-apGray-700" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-apBlue-600" />
          </button>
        </div>
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-apBlue-100 text-apBlue-800">
            {userRole === 'HQ_ADMIN' ? 'HA' : 'DA'}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default AppHeader;
