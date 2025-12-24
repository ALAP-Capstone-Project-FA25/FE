import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '../shared/app-sidebar';
import AccountStatusChecker from '../auth/AccountStatusChecker';
import __helpers from '@/helpers';

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-screen  ">
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <main className="w-full">{children}</main>
        <AccountStatusChecker />
      </SidebarProvider>
    </div>
  );
}
