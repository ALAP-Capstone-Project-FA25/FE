'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/ui/sidebar';
import { adminNavItems, managerNavItems, USER_ROLE } from '@/constants/data';
import {
  ChevronRight,
  ChevronsUpDown,
  LogOut,
  User,
  Book,
  BookOpen
} from 'lucide-react';
import { usePathname, useRouter } from '@/routes/hooks';
import { useAuth } from '@/routes/hooks/use.auth';
import { Icons } from '../ui/icons';
import __helpers from '@/helpers';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { useGetMyInfo } from '@/queries/user.query';
import { useState, useEffect } from 'react';

export const company = {
  name: 'ALAP',
  logo: Book
};

export default function AppSidebar() {
  const { data: session } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const {} = useGetMyInfo();
  const infoUser = useSelector((state: RootState) => state.auth.infoUser);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const handleLogout = () => {
    __helpers.cookie_delete('AT');
    window.location.href = '/admin/login';
  };

  const isAdmin = infoUser?.role == USER_ROLE.ADMIN;

  const navItems = isAdmin ? adminNavItems : managerNavItems;

  // Tự động mở menu chứa route hiện tại
  useEffect(() => {
    const newOpenItems: Record<string, boolean> = {};
    navItems.forEach((parent) => {
      parent.detail.forEach((item) => {
        if (item.items && item.items.length > 0) {
          const hasActiveSubItem = item.items.some((subItem) => pathname === subItem.url);
          if (hasActiveSubItem || pathname === item.url) {
            newOpenItems[item.title] = true;
          }
        }
      });
    });
    setOpenItems(newOpenItems);
  }, [pathname, navItems]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Sidebar
      collapsible="icon"
      className="-50 dark:-950/60 border-r border-orange-100 dark:border-orange-200"
    >
      <SidebarHeader className="bg-gradient-to-r transition-colors ">
        <div className="dark:-100 flex items-center gap-3 py-1">
          <div>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate text-xl font-bold tracking-wide drop-shadow-sm">
              {company.name}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden pt-2">
        {navItems.map((parent, index) => (
          <SidebarGroup key={index} className="">
            <SidebarGroupLabel className="mb-1 text-xs font-semibold uppercase tracking-wider ">
              {parent.label}
            </SidebarGroupLabel>
            <SidebarMenu>
              {parent?.detail.map((item) => {
                const Icon = item.icon ? Icons[item.icon] : Icons.dashboard;
                const isActive = pathname === item.url;

                return item?.items && item?.items?.length > 0 ? (
                  <Collapsible
                    key={item.title}
                    asChild
                    open={openItems[item.title] || false}
                    onOpenChange={(open) => 
                      setOpenItems(prev => ({ ...prev, [item.title]: open }))
                    }
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={isActive}
                          className={`my-1 rounded-lg transition-all  ${
                            isActive ? '' : ''
                          }`}
                        >
                          <div
                            className={`mr-3 flex size-6 items-center justify-center rounded-md ${
                              isActive
                                ? '-200 dark:-950/30 -900 dark:-100'
                                : '-400 dark:-200'
                            }`}
                          >
                            <Icon className="size-5" />
                          </div>
                          <span className="font-medium">{item.title}</span>
                          <ChevronRight
                            className={`ml-auto size-4 transition-transform duration-200 ${
                              isActive ? '' : ''
                            } group-data-[state=open]/collapsible:rotate-90`}
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => {
                            const isSubActive = pathname === subItem.url;
                            return (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isSubActive}
                                  className={`rounded-lg pl-9 transition-all ${
                                    isSubActive
                                      ? '-100 dark:-950/10 -800 dark:-100 font-semibold'
                                      : 'hover:-50 dark:hover:-900/10'
                                  }`}
                                >
                                  <button
                                    onClick={() => router.push(subItem.url)}
                                    className="flex w-full items-center"
                                  >
                                    <span>{subItem.title}</span>
                                  </button>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive}
                      className={`hover:-100 dark:hover:-900/10 my-1 rounded-lg transition-all ${
                        isActive ? '-100 dark:-900/20 -800 dark:-100' : ''
                      }`}
                    >
                      <button
                        onClick={() => router.push(item.url)}
                        className="flex w-full items-center"
                      >
                        <div
                          className={`mr-3 flex size-6 items-center justify-center rounded-md ${
                            isActive
                              ? '-200 dark:-950/30 -800 dark:-100'
                              : '-400 dark:-200'
                          }`}
                        >
                          <Icon className="size-5" />
                        </div>
                        <span className="font-medium">{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="-50/60 dark:-950/10 border-t border-orange-100 dark:border-orange-200">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="hover:-100/60 data-[state=open]:-100/80 dark:hover:-900/10 data-[state=open]:dark:-900/20 rounded-lg"
                >
                  <Avatar className="-50 dark:-950/40 h-11 w-11 rounded-lg border-2 border-orange-100 shadow-sm dark:border-orange-200">
                    <AvatarImage
                      src={session?.user?.image || ''}
                      alt={session?.user?.name || ''}
                    />
                    <AvatarFallback className="-800 bg-gradient-to-br from-orange-200 to-orange-400 text-lg font-bold dark:text-white">
                      {getInitials(infoUser?.userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3 grid flex-1 text-left leading-tight">
                    <span className="-800 dark:-100 truncate font-bold">
                      {infoUser?.username || 'admin'}
                    </span>
                    <span className="-600 dark:-300 truncate text-xs">
                      {infoUser?.email || 'admin@livesctock.com'}
                    </span>
                  </div>
                  <ChevronsUpDown className="-300 dark:-200 ml-auto size-5" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="-50 dark:-950/60 w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg border border-orange-100 shadow-lg dark:border-orange-200"
                side="bottom"
                align="end"
                sideOffset={6}
              >
                <DropdownMenuItem
                  onClick={() => router.push(`/user-profile`)}
                  className="hover:-100 dark:hover:-900/10 cursor-pointer gap-2 rounded-md"
                >
                  <User size={18} className="-400 dark:-200" />
                  <span>Thông tin tài khoản</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="-100 dark:-700" />
                <DropdownMenuItem
                  onClick={() => handleLogout()}
                  className="dark:hover:-900/10 cursor-pointer gap-2 rounded-md text-red-500 hover:bg-red-50"
                >
                  <LogOut size={18} />
                  <span>Thoát</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
