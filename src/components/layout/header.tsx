import {
  CalendarClock,
  Home,
  LogOutIcon,
  Map,
  Package,
  User2,
  BookOpen,
  Settings
} from 'lucide-react';
import { Button } from '../ui/button';
import { usePathname, useRouter } from '@/routes/hooks';
import { useState, useRef, useEffect } from 'react';
import LoginDialog from '../auth/login-dialog';
import __helpers from '@/helpers';
import { useGetMyInfo } from '@/queries/user.query';
import { USER_ROLE } from '@/constants/data';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';
import NotificationDropdown from '../notification/NotificationDropdown';
import SearchDropdown from '../search/SearchDropdown';

const NAV_ITEMS = [
  {
    key: 'home',
    label: 'Trang chủ',
    icon: Home,
    path: '/'
  },
  {
    key: 'roadmap',
    label: 'Lộ trình',
    icon: Map,
    path: '/pick-category-to-knowledge'
  },
  {
    key: 'events',
    label: 'Sự kiện',
    icon: CalendarClock,
    path: '/events'
  },
  {
    key: 'blog',
    label: 'Blog',
    icon: BookOpen,
    path: '/blog'
  },
  {
    key: 'pricing',
    label: 'Gói học',
    icon: Package,
    path: '/pricing'
  }
];

export default function Header() {
  const router = useRouter();
  const currentPath = usePathname();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const isLogin = __helpers.cookie_get('AT');

  // Dropdown state for user profile menu
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: infoUser } = useGetMyInfo();

  // Tour guide state
  const [runTour, setRunTour] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);

  // Check if user needs to see the tour
  useEffect(() => {
    if (infoUser && isLogin) {
      const hasSeenTour = localStorage.getItem('majorTourCompleted');
      const hasMajor = !!infoUser?.majorModel?.name;

      if (!hasMajor && !hasSeenTour && !tourCompleted) {
        setTimeout(() => {
          setRunTour(true);
        }, 500);
      }
    }
  }, [infoUser, isLogin, tourCompleted]);

  // Tour steps
  const tourSteps: Step[] = [
    {
      target: '#pick-major-button',
      content: (
        <div className="text-left">
          <h3 className="mb-2 text-lg font-semibold">
            👋 Chào mừng bạn đến với A Level Adaptive Learning!
          </h3>
          <p className="text-sm">
            Để có trải nghiệm học tập tốt nhất, hãy chọn chuyên ngành của bạn.
            Điều này giúp chúng tôi đề xuất nội dung phù hợp nhất cho bạn.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true
    }
  ];

  // Handle tour callback
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      setTourCompleted(true);
      localStorage.setItem('majorTourCompleted', 'true');

      if (action === 'close' || action === 'next') {
        router.push('/pick-major');
      }
    }
  };

  useEffect(() => {
    if (!userDropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen]);

  const handleLogout = () => {
    __helpers.cookie_delete('AT');
    setUserDropdownOpen(false);
    window.location.reload();
  };

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  return (
    <>
      {/* Tour Guide */}
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#f97316', // orange-500
            zIndex: 10000
          },
          tooltip: {
            borderRadius: 12,
            padding: 20
          },
          buttonNext: {
            backgroundColor: '#f97316',
            borderRadius: 8,
            padding: '8px 16px'
          },
          buttonSkip: {
            color: '#6b7280'
          }
        }}
        locale={{
          back: 'Quay lại',
          close: 'Đóng',
          last: 'Xem ngay',
          next: 'Chọn ngay',
          skip: 'Bỏ qua'
        }}
      />

      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50 }}>
        <header className="bg-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-lg font-bold text-white">
                AP
              </div>
              <span className="font-semibold text-gray-800">
                A LEVEL ADAPTIVE LEARNING
              </span>
            </div>

            <div className="mx-12 max-w-xl flex-1">
              <SearchDropdown />
            </div>

            <div className="flex items-center gap-6">
              {infoUser?.majorModel?.name ? (
                <span
                  id="pick-major-button"
                  className="cursor-pointer rounded-full bg-orange-500 px-4 py-2 text-sm text-white transition-all duration-300 
                  hover:scale-105 hover:text-white"
                  onClick={() => {
                    router.push('/pick-major');
                  }}
                >
                  {infoUser?.majorModel?.name}
                </span>
              ) : (
                isLogin && (
                  <p
                    id="pick-major-button"
                    className="cursor-pointer text-orange-500 hover:text-orange-600"
                    onClick={() => {
                      router.push('/pick-major');
                    }}
                  >
                    Chọn nhóm môn
                  </p>
                )
              )}
              {isLogin && <NotificationDropdown />}
              {/* Admin Management Button - only show if admin and not in admin section */}
              {isLogin &&
                infoUser?.role === USER_ROLE.ADMIN &&
                !currentPath.startsWith('/admin') && (
                  <Button
                    onClick={() => router.push('/admin/dashboard')}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:from-orange-600 hover:to-orange-700"
                    size="sm"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Trang Quản Lý
                  </Button>
                )}
              {isLogin ? (
                <div className="relative" ref={dropdownRef}>
                  <div
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-orange-500 bg-gray-300 transition-colors hover:bg-gray-400"
                    onClick={() => setUserDropdownOpen((o) => !o)}
                    title="Tài khoản"
                  >
                    <img
                      src={
                        infoUser?.avatar ||
                        'https://img.freepik.com/premium-vector/person-with-blue-shirt-that-says-name-person_1029948-7040.jpg?semt=ais_se_enriched&w=740&q=80'
                      }
                      alt="avatar"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  </div>
                  {userDropdownOpen && (
                    <div className="absolute right-0 z-40 mt-2 w-48 rounded-md border bg-white py-2 shadow-lg">
                      <div className="select-none px-4 py-2 text-sm font-semibold text-gray-800">
                        Tài khoản của tôi
                      </div>
                      <div
                        className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          router.push('/profile');
                          setUserDropdownOpen(false);
                        }}
                      >
                        <User2 className="h-4 w-4" />
                        Xem hồ sơ
                      </div>
                      <div
                        className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          router.push('/my-profile');
                          setUserDropdownOpen(false);
                        }}
                      >
                        <User2 className="h-4 w-4" />
                        Chỉnh sửa thông tin
                      </div>
                      <div
                        className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          router.push('/my-event-ticket');
                          setUserDropdownOpen(false);
                        }}
                      >
                        <CalendarClock className="h-4 w-4" />
                        Event tham dự
                      </div>

                      <div className="my-1 border-t" />
                      <div
                        className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        onClick={handleLogout}
                      >
                        <LogOutIcon size={16} />
                        <span>Đăng xuất</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  onClick={() => setIsLoginDialogOpen(true)}
                  variant="default"
                  className="bg-orange-500 text-white hover:bg-orange-600"
                >
                  Đăng nhập
                </Button>
              )}
            </div>
          </div>
        </header>
      </div>

      <aside className="fixed left-0 top-[76px] flex h-[calc(100vh-76px)] w-20 flex-col items-center gap-8 bg-[#e5e7eb80] py-6 shadow-sm">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <div
              key={item.key}
              className={`flex cursor-pointer flex-col items-center gap-2 transition-colors ${
                active
                  ? 'text-orange-500'
                  : 'text-gray-600 hover:text-orange-500'
              }`}
              onClick={() => {
                if (currentPath !== item.path) router.push(item.path);
              }}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs">{item.label}</span>
            </div>
          );
        })}
      </aside>

      <LoginDialog
        open={isLoginDialogOpen}
        onOpenChange={setIsLoginDialogOpen}
      />
    </>
  );
}
