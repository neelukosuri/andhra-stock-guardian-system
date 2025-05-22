
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
  Settings,
  Building,
  BarChart3,
  ArrowLeft
} from 'lucide-react';

const menuItems = [
  {
    label: 'Dashboard',
    icon: Home,
    href: '/'
  },
  {
    label: 'HQ Operations',
    items: [
      {
        label: 'Item Master',
        icon: Package,
        href: '/item-master'
      },
      {
        label: 'Stock Management',
        icon: ClipboardList,
        href: '/stock-management'
      },
      {
        label: 'Issue To Districts',
        icon: Send,
        href: '/issue-to-districts'
      },
      {
        label: 'LAR From Districts',
        icon: RotateCcw,
        href: '/lar-from-districts'
      },
      {
        label: 'Loan Items',
        icon: Truck,
        href: '/loan-items'
      },
      {
        label: 'Loan Items Return',
        icon: ArrowLeft,
        href: '/loan-items-return'
      },
      {
        label: 'Reports',
        icon: FileText,
        href: '/reports'
      }
    ]
  },
  {
    label: 'District Operations',
    items: [
      {
        label: 'District Inventory',
        icon: Building,
        href: '/district-inventory'
      },
      {
        label: 'Issue To Offices',
        icon: Send,
        href: '/issue-to-offices'
      },
      {
        label: 'LAR From Offices',
        icon: RotateCcw,
        href: '/lar-from-offices'
      },
      {
        label: 'District Reports',
        icon: BarChart3,
        href: '/district-reports'
      }
    ]
  },
  {
    label: 'Administration',
    items: [
      {
        label: 'User Management',
        icon: Users,
        href: '/user-management'
      }
    ]
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  
  // We now use state === "expanded" instead of collapsed
  const collapsed = state === "collapsed";

  /* Helper to check if a URL is active */
  const isActive = (path: string) => currentPath === path;

  /* Helper to check if any child in a group is active */
  const isGroupActive = (items: any[]) => items.some((item) => isActive(item.href));

  /* Helper for navigation link class based on active state */
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center w-full p-2 rounded-md transition-colors ${
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-gray-700 hover:bg-slate-100'
    }`;

  return (
    <Sidebar
      className={`border-r border-gray-200 bg-white transition-all ${
        collapsed ? 'w-14' : 'w-64'
      }`}
      collapsible="icon"
    >
      {/* Mobile-friendly trigger */}
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        {menuItems.map((menuGroup, index) => (
          menuGroup.items ? (
            <SidebarGroup
              key={index}
              // Using open instead of defaultOpen for controlled component
              open={isGroupActive(menuGroup.items)}
              onOpenChange={() => {}}
            >
              <SidebarGroupLabel className={`${collapsed ? 'sr-only' : ''}`}>
                {menuGroup.label}
              </SidebarGroupLabel>

              <SidebarGroupContent>
                <SidebarMenu>
                  {menuGroup.items.map((item, itemIndex) => (
                    <SidebarMenuItem key={itemIndex}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.href} end className={getNavClass}>
                          <item.icon className="h-5 w-5" />
                          {!collapsed && <span className="ml-3">{item.label}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ) : (
            <SidebarMenu key={index}>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to={menuGroup.href} end className={getNavClass}>
                    <menuGroup.icon className="h-5 w-5" />
                    {!collapsed && <span className="ml-3">{menuGroup.label}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          )
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
