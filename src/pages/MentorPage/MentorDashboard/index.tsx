import {
  Card,
  CardContent
} from '@/components/ui/card';
import {
  BookOpen,
  MessageSquare,
  Loader2
} from 'lucide-react';
import BasePages from '@/components/shared/base-pages';
import { useGetMentorDashboardStats } from '@/queries/dashboard.query';
import { useNavigate } from 'react-router-dom';

const MentorDashboard = () => {
  const navigate = useNavigate();
  const { data: dashboardStats, isLoading: isLoadingStats } = useGetMentorDashboardStats();

  // Stats data from API
  const stats = [
    {
      title: 'Khóa học đang quản lý',
      value: dashboardStats?.totalCourses?.toString() || '0',
      icon: BookOpen,
      color: 'orange',
      link: '/mentor/courses'
    },
    {
      title: 'Tin nhắn học viên',
      value: dashboardStats?.totalStudentMessages?.toLocaleString() || '0',
      icon: MessageSquare,
      color: 'blue',
      link: '/mentor/chat-room'
    }
  ];

  // Loading state
  if (isLoadingStats) {
    return (
      <BasePages
        className="relative flex-1 space-y-4 overflow-y-auto px-4"
        pageHead="Dashboard"
        breadcrumbs={[{ title: 'Dashboard', link: '/mentor/dashboard' }]}
      >
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
        </div>
      </BasePages>
    );
  }

  return (
    <BasePages
      className="relative flex-1 space-y-4 overflow-y-auto px-4"
      pageHead="Dashboard"
      breadcrumbs={[{ title: 'Dashboard', link: '/mentor/dashboard' }]}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tổng quan</h2>
            <p className="text-gray-600">Thống kê khóa học và tin nhắn học viên</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const colorClasses = {
              orange: 'from-orange-500 to-orange-600',
              blue: 'from-blue-500 to-blue-600',
              green: 'from-green-500 to-green-600',
              purple: 'from-purple-500 to-purple-600'
            };

            return (
              <Card
                key={index}
                className="border-none shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                onClick={() => stat.link && navigate(stat.link)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`h-12 w-12 rounded-xl bg-gradient-to-br ${colorClasses[stat.color]} flex items-center justify-center shadow-lg`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </BasePages>
  );
};

export default MentorDashboard;

