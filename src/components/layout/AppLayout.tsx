
import React, { useState } from 'react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider
} from "@/components/ui/sidebar";
import { NavLink } from 'react-router-dom';
import { 
  Box, 
  PackageSearch, 
  FileInput, 
  Archive, 
  SendHorizontal,
  ArrowLeft,
  User,
  Settings,
  LogOut,
  FileText,
  Package,
  Database,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import AppHeader from './AppHeader';
import { useToast } from '@/hooks/use-toast';

// Sidebar links for different roles
const hqLinks = [
  { title: "Dashboard", path: "/", icon: <Box className="w-5 h-5 mr-3" /> },
  { title: "Item Master", path: "/item-master", icon: <PackageSearch className="w-5 h-5 mr-3" /> },
  { title: "Stock Management", path: "/stock-management", icon: <Database className="w-5 h-5 mr-3" /> },
  { title: "Loan Items", path: "/loan-items", icon: <Archive className="w-5 h-5 mr-3" /> },
  { title: "Issue to Districts", path: "/issue-to-districts", icon: <SendHorizontal className="w-5 h-5 mr-3" /> },
  { title: "LAR from Districts", path: "/lar-from-districts", icon: <ArrowLeft className="w-5 h-5 mr-3" /> },
  { title: "User Management", path: "/user-management", icon: <User className="w-5 h-5 mr-3" /> },
  { title: "Reports", path: "/reports", icon: <FileText className="w-5 h-5 mr-3" /> }
];

const districtLinks = [
  { title: "District Dashboard", path: "/", icon: <Box className="w-5 h-5 mr-3" /> },
  { title: "District Inventory", path: "/district-inventory", icon: <Package className="w-5 h-5 mr-3" /> },
  { title: "Issue to Offices", path: "/issue-to-offices", icon: <SendHorizontal className="w-5 h-5 mr-3" /> },
  { title: "LAR from Offices", path: "/lar-from-offices", icon: <ArrowLeft className="w-5 h-5 mr-3" /> },
  { title: "Reports", path: "/district-reports", icon: <FileText className="w-5 h-5 mr-3" /> }
];

export interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [userRole, setUserRole] = useState<'HQ_ADMIN' | 'DISTRICT_ADMIN'>('HQ_ADMIN'); // Default to HQ_ADMIN for now
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  const links = userRole === 'HQ_ADMIN' ? hqLinks : districtLinks;
  
  // Check if current path is included in available links for current role
  const isActive = (path: string) => location.pathname === path;
  
  // Function to determine NavLink active class
  const getNavClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center w-full px-3 py-2 rounded-md transition-colors ${
      isActive 
        ? 'bg-apBlue-100 text-apBlue-700 font-medium' 
        : 'hover:bg-apGray-100'
    }`;

  return (
    <div className="flex min-h-screen w-full bg-apGray-100">
      <SidebarProvider>
        <Sidebar
          className={sidebarCollapsed ? "w-14" : "w-60"}
          collapsible="icon"
        >
          <div className="h-16 flex items-center justify-center border-b border-apGray-200">
            <h2 className="font-semibold text-lg text-apBlue-800">AP Police Comms</h2>
          </div>
          
          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupLabel className="text-apGray-600 text-xs uppercase tracking-wider font-medium px-3 py-2">
                Main Navigation
              </SidebarGroupLabel>
              
              <SidebarGroupContent>
                <SidebarMenu>
                  {links.map(link => (
                    <SidebarMenuItem key={link.path}>
                      <SidebarMenuButton asChild>
                        <NavLink to={link.path} className={getNavClass}>
                          {link.icon}
                          <span>{!sidebarCollapsed && link.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <div className="absolute bottom-0 left-0 w-full border-t border-apGray-200 p-2">
              <div className="flex flex-col gap-1">
                <button 
                  onClick={toggleRole}
                  className="flex items-center w-full px-3 py-2 rounded-md hover:bg-apGray-100 transition-colors text-apGray-700"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  {!sidebarCollapsed && <span>Switch Role</span>}
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 rounded-md hover:bg-apGray-100 transition-colors text-apGray-700"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  {!sidebarCollapsed && <span>Logout</span>}
                </button>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>
        
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
