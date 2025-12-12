import __helpers from '@/helpers';
import Header from './header';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full min-h-screen  bg-gray-200/50">
      <Header />
      <main className="mx-auto ml-[80px]">{children}</main>
      {/* <Footer /> */}
    </div>
  );
}
