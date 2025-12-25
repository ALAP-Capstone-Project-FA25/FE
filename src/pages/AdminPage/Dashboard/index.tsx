import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  Users,
  TrendingUp,
  Clock,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Star,
  Calendar,
  DollarSign,
  Target,
  Loader2
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import BasePages from '@/components/shared/base-pages';
import {
  useGetDashboardStats,
  useGetRevenueChart,
  useGetStudentGrowthChart,
  useGetCourseDistribution,
  useGetTopCourses,
  useGetRecentCourses
} from '@/queries/dashboard.query';
import __helpers from '@/helpers';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CourseDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // API Queries
  const { data: dashboardStats, isLoading: isLoadingStats } = useGetDashboardStats();
  const { data: revenueChart, isLoading: isLoadingRevenue } = useGetRevenueChart(selectedPeriod);
  const { data: studentGrowth, isLoading: isLoadingStudents } = useGetStudentGrowthChart();
  const { data: courseDistribution, isLoading: isLoadingDistribution } = useGetCourseDistribution();
  const { data: topCourses, isLoading: isLoadingTopCourses } = useGetTopCourses();
  const { data: recentCourses, isLoading: isLoadingRecentCourses } = useGetRecentCourses();

  // Chart data configurations
  const revenueChartData = {
    labels: revenueChart?.labels || [],
    datasets: [
      {
        label: 'Doanh thu (vnđ)',
        data: revenueChart?.data || [],
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(249, 115, 22)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderRadius: 8,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        displayColors: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          font: { size: 11 },
          color: '#6b7280'
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          font: { size: 11 },
          color: '#6b7280'
        }
      }
    }
  };

  const studentChartData = {
    labels: studentGrowth?.labels || [],
    datasets: [
      {
        label: 'Học viên mới',
        data: studentGrowth?.data || [],
        backgroundColor: 'rgba(249, 115, 22, 0.8)',
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  };

  const studentChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderRadius: 8,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        displayColors: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          font: { size: 11 },
          color: '#6b7280'
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          font: { size: 11 },
          color: '#6b7280'
        }
      }
    }
  };

  const courseChartData = {
    labels: courseDistribution?.labels || [],
    datasets: [
      {
        data: courseDistribution?.data || [],
        backgroundColor: [
          'rgba(249, 115, 22, 0.9)',
          'rgba(59, 130, 246, 0.9)',
          'rgba(34, 197, 94, 0.9)',
          'rgba(168, 85, 247, 0.9)',
          'rgba(236, 72, 153, 0.9)'
        ],
        borderWidth: 0,
        hoverOffset: 10
      }
    ]
  };

  const courseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 },
          color: '#6b7280',
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderRadius: 8,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: function (context) {
            return context.label + ': ' + context.parsed + '%';
          }
        }
      }
    },
    cutout: '65%'
  };

  const performanceChartData = {
    labels: topCourses?.map(course => course.title) || [],
    datasets: [
      {
        label: 'Tỷ lệ hoàn thành (%)',
        data: topCourses?.map(course => course.completionRate) || [],
        backgroundColor: [
          'rgba(249, 115, 22, 0.9)',
          'rgba(59, 130, 246, 0.9)',
          'rgba(34, 197, 94, 0.9)',
          'rgba(168, 85, 247, 0.9)',
          'rgba(236, 72, 153, 0.9)'
        ],
        borderRadius: 6
      }
    ]
  };

  const performanceChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderRadius: 8,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        displayColors: false
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          font: { size: 11 },
          color: '#6b7280',
          callback: function (value) {
            return value + '%';
          }
        }
      },
      y: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          font: { size: 11 },
          color: '#6b7280'
        }
      }
    }
  };

  // Stats data from API
  const stats = [
    {
      title: 'Tổng khóa học',
      value: dashboardStats?.totalCourses?.toString() || '0',
      change: dashboardStats?.courseGrowth || '+0%',
      icon: BookOpen,
      color: 'orange',
      trend: 'up'
    },
    {
      title: 'Học viên',
      value: dashboardStats?.totalStudents?.toLocaleString() || '0',
      change: dashboardStats?.studentGrowth || '+0%',
      icon: Users,
      color: 'blue',
      trend: 'up'
    },
    {
      title: 'Doanh thu',
      value: __helpers.formatCurrency(dashboardStats?.totalRevenue || 0),
      change: dashboardStats?.revenueGrowth || '+0%',
      icon: DollarSign,
      color: 'green',
      trend: 'up'
    },
    {
      title: 'Tỷ lệ hoàn thành',
      value: `${dashboardStats?.averageCompletionRate || 0}%`,
      change: dashboardStats?.completionRateGrowth || '+0%',
      icon: Target,
      color: 'purple',
      trend: 'up'
    }
  ];

  // Courses data from API
  const courses = recentCourses || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'archived':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Đang hoạt động';
      case 'draft':
        return 'Nháp';
      case 'archived':
        return 'Đã lưu trữ';
      default:
        return status;
    }
  };

  // Loading state
  if (isLoadingStats || isLoadingRevenue || isLoadingStudents || isLoadingDistribution) {
    return (
      <BasePages
        className="relative flex-1 space-y-4 overflow-y-auto px-4"
        pageHead="Dashboard"
        breadcrumbs={[{ title: 'Dashboard', link: '/admin/dashboard' }]}
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
      breadcrumbs={[{ title: 'Dashboard', link: '/admin/dashboard' }]}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h2>
            <p className="text-gray-600">Thống kê và báo cáo tổng quan</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-200 hover:bg-orange-50"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Lịch học
            </Button>
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:from-orange-600 hover:to-orange-700">
              <Plus className="mr-2 h-4 w-4" />
              Tạo khóa học
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                className="border-none shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
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
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">
                          {stat.change}
                        </span>
                        <span className="text-xs text-gray-500">
                          so với tháng trước
                        </span>
                      </div>
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Revenue Chart */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    Doanh thu theo tháng
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm text-gray-500">
                    Tổng quan doanh thu năm 2024
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {['month', 'quarter', 'year'].map((period) => (
                    <Button
                      key={period}
                      variant={
                        selectedPeriod === period ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => setSelectedPeriod(period)}
                      className={
                        selectedPeriod === period
                          ? 'h-8 bg-gradient-to-r from-orange-500 to-orange-600 text-xs text-white'
                          : 'h-8 border-gray-200 text-xs hover:bg-orange-50'
                      }
                    >
                      {period === 'month'
                        ? 'Tháng'
                        : period === 'quarter'
                          ? 'Quý'
                          : 'Năm'}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Line
                  data={revenueChartData as any}
                  options={revenueChartOptions as any}
                />
              </div>
            </CardContent>
          </Card>

          {/* Student Growth Chart */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-900">
                Tăng trưởng học viên
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-gray-500">
                Số học viên mới đăng ký theo tháng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Bar
                  data={studentChartData}
                  options={studentChartOptions as any}
                />
              </div>
            </CardContent>
          </Card>

          {/* Course Categories Chart */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-900">
                Phân bố khóa học
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-gray-500">
                Tỷ lệ khóa học theo danh mục
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center">
                <Doughnut
                  data={courseChartData}
                  options={courseChartOptions as any}
                />
              </div>
            </CardContent>
          </Card>

          {/* Performance Chart */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-900">
                Top khóa học hiệu quả
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-gray-500">
                Tỷ lệ hoàn thành của học viên
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Bar
                  data={performanceChartData}
                  options={performanceChartOptions as any}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        
    
      </div>
    </BasePages>
  );
};

export default CourseDashboard;
