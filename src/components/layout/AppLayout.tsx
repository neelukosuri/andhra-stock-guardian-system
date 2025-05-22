
import React, { useState } from 'react';
import { 
  SidebarProvider 
} from "@/components/ui/sidebar";
import { NavLink } from 'react-router-dom';
import { 
  LogOut,
  Settings,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import AppHeader from './AppHeader';
import { useToast } from '@/hooks/use-toast';
import { AppSidebar } from './AppSidebar';

export interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [userRole, setUserRole] = useState<'HQ_ADMIN' | 'DISTRICT_ADMIN'>('HQ_ADMIN'); // Default to HQ_ADMIN for now
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = () => {
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of the system."
    });
    // In a real app, this would include real authentication logic
  };
  
  const toggleRole = () => {
    setUserRole(userRole === 'HQ_ADMIN' ? 'DISTRICT_ADMIN' : 'HQ_ADMIN');
    toast({
      title: "Role switched",
      description: `Switched to ${userRole === 'HQ_ADMIN' ? 'District Admin' : 'HQ Admin'} view.`
    });
  };
  
  return (
    <div className="flex min-h-screen w-full bg-white">
      <SidebarProvider>
        <AppSidebar />
        
        <div className="flex flex-col flex-1">
          <AppHeader userRole={userRole} />
          <main className="flex-1 p-6 overflow-auto animate-fade-in">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default AppLayout;
