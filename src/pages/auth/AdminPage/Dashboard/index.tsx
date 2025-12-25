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
  Target
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

  // Chart data configurations
  const revenueChartData = {
    labels: [
      'T1',
      'T2',
      'T3',
      'T4',
      'T5',
      'T6',
      'T7',
      'T8',
      'T9',
      'T10',
      'T11',
      'T12'
    ],
    datasets: [
      {
        label: 'Doanh thu (triệu ₫)',
        data: [25, 28, 32, 30, 35, 38, 42, 40, 45, 48, 52, 55],
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
    labels: [
      'T1',
      'T2',
      'T3',
      'T4',
      'T5',
      'T6',
      'T7',
      'T8',
      'T9',
      'T10',
      'T11',
      'T12'
    ],
    datasets: [
      {
        label: 'Học viên mới',
        data: [85, 92, 110, 98, 125, 135, 150, 142, 168, 175, 185, 195],
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
    labels: ['Lập trình', 'Thiết kế', 'Marketing', 'Kinh doanh', 'Ngoại ngữ'],
    datasets: [
      {
        data: [35, 25, 15, 15, 10],
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
    labels: [
      'React Advanced',
      'Node.js Backend',
      'UI/UX Design',
      'Python Data',
      'JavaScript Pro'
    ],
    datasets: [
      {
        label: 'Tỷ lệ hoàn thành (%)',
        data: [92, 88, 85, 78, 95],
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

  // Mock data
  const stats = [
    {
      title: 'Tổng khóa học',
      value: '24',
      change: '+12%',
      icon: BookOpen,
      color: 'orange',
      trend: 'up'
    },
    {
      title: 'Học viên',
      value: '1,429',
      change: '+23%',
      icon: Users,
      color: 'blue',
      trend: 'up'
    },
    {
      title: 'Doanh thu',
      value: '₫45.2M',
      change: '+18%',
      icon: DollarSign,
      color: 'green',
      trend: 'up'
    },
    {
      title: 'Tỷ lệ hoàn thành',
      value: '87%',
      change: '+5%',
      icon: Target,
      color: 'purple',
      trend: 'up'
    }
  ];

  const courses = [
    {
      id: 1,
      title: 'Advanced React & TypeScript',
      instructor: 'Nguyễn Văn A',
      students: 156,
      rating: 4.8,
      duration: '12 tuần',
      status: 'active',
      thumbnail: '🎨',
      progress: 75,
      revenue: '₫12.5M'
    },
    {
      id: 2,
      title: 'Node.js Backend Development',
      instructor: 'Trần Thị B',
      students: 243,
      rating: 4.9,
      duration: '10 tuần',
      status: 'active',
      thumbnail: '⚡',
      progress: 90,
      revenue: '₫18.3M'
    },
    {
      id: 3,
      title: 'UI/UX Design Fundamentals',
      instructor: 'Lê Minh C',
      students: 189,
      rating: 4.7,
      duration: '8 tuần',
      status: 'active',
      thumbnail: '🎭',
      progress: 60,
      revenue: '₫9.8M'
    },
    {
      id: 4,
      title: 'Python Data Science',
      instructor: 'Phạm Văn D',
      students: 98,
      rating: 4.6,
      duration: '14 tuần',
      status: 'draft',
      thumbnail: '📊',
      progress: 30,
      revenue: '₫5.2M'
    }
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AP Learning</h1>
                <p className="text-xs text-gray-500">
                  Hệ thống quản lý khóa học
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="hidden border-gray-200 hover:bg-orange-50 sm:flex"
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
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
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

        {/* Search and Filters */}
        <Card className="mb-6 border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm khóa học..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 border-gray-200 pl-10 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div className="flex gap-2">
                {['all', 'active', 'draft'].map((filter) => (
                  <Button
                    key={filter}
                    variant={selectedFilter === filter ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFilter(filter)}
                    className={
                      selectedFilter === filter
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                        : 'border-gray-200 hover:bg-orange-50'
                    }
                  >
                    {filter === 'all'
                      ? 'Tất cả'
                      : filter === 'active'
                        ? 'Hoạt động'
                        : 'Nháp'}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses List */}
        <div className="space-y-4">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="border-none shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              <CardContent className="p-6">
                <div className="flex flex-col gap-6 lg:flex-row">
                  {/* Thumbnail */}
                  <div className="flex h-24 w-full flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 text-4xl shadow-inner lg:w-24">
                    {course.thumbnail}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="mb-1 text-lg font-bold text-gray-900">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Giảng viên: {course.instructor}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(course.status)} border`}
                      >
                        {getStatusText(course.status)}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Tiến độ hoàn thành</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-orange-500" />
                        <span className="font-medium">{course.students}</span>
                        <span>học viên</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span className="font-medium">{course.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="font-medium">{course.revenue}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 lg:flex-col lg:justify-start">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Xem
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Sửa
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-200 hover:border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CourseDashboard;
