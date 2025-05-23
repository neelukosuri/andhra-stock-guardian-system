
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

import {
  Home,
  Package,
  ClipboardList,
  Truck,
  Send,
  RotateCcw,
  FileText,
  Users,
  Building,
  BarChart3,
  ArrowLeft,
  Settings,
  Bell,
} from 'lucide-react';

const menuItems = [
  {
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard'
  },
  {
    label: 'Item Master',
    icon: Package,
    href: '/item-master'
  },
  {
    label: 'HQ Inventory',
    icon: Building,
    href: '/stock-management'
  },
  {
    label: 'Item Issuance',
    icon: Send,
    href: '/issue-to-districts'
  },
  {
    label: 'Item Returns',
    icon: RotateCcw,
    href: '/lar-from-districts'
  },
  {
    label: 'Local Inventory',
    icon: ClipboardList,
    href: '/district-inventory'
  },
  {
    label: 'Reports',
    icon: FileText,
    href: '/reports'
  },
  {
    label: 'Alerts',
    icon: Bell,
    href: '/alerts'
  },
  {
    label: 'User Management',
    icon: Users,
    href: '/user-management'
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/settings'
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const collapsed = state === "collapsed";

  return (
    <Sidebar
      className="bg-[#1A3A67] border-r-0 shadow-md"
      collapsible="icon"
    >
      <div className="h-16 flex items-center justify-center border-b border-white/10">
        <div className="text-white font-bold text-2xl">
          {collapsed ? "AP" : "AP POLICE"}
        </div>
      </div>

      <SidebarTrigger className="m-2 self-end text-white/80 hover:text-white" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/50 text-xs uppercase tracking-wider font-medium">
            Asset Management
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.href} 
                      className={({ isActive }) =>
                        `flex items-center w-full p-2.5 rounded-md transition-colors ${
                          isActive
                            ? 'bg-white/10 text-white font-medium'
                            : 'text-white/80 hover:bg-white/5 hover:text-white'
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 min-w-5" />
                      {!collapsed && <span className="ml-2.5 truncate">{item.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
