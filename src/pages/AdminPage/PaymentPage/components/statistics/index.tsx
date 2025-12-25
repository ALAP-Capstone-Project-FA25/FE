import { useGetPaymentStatistics } from '@/queries/payment.query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  CheckCircle,
  Loader2
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const PAYMENT_STATUS_LABELS: Record<number, string> = {
  1: 'Chờ thanh toán',
  2: 'Đã thanh toán',
  3: 'Đã hủy',
  4: 'Hết hạn'
};

const PAYMENT_STATUS_COLORS: Record<number, string> = {
  1: 'rgba(234, 179, 8, 0.8)',
  2: 'rgba(34, 197, 94, 0.8)',
  3: 'rgba(239, 68, 68, 0.8)',
  4: 'rgba(156, 163, 175, 0.8)'
};

export function StatisticsTab() {
  const { data, isPending } = useGetPaymentStatistics();

  if (isPending) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const stats = data || {};

  // Doughnut Chart - Status Distribution
  const statusChartData = {
    labels:
      stats.statusStats?.map(
        (s: any) => PAYMENT_STATUS_LABELS[s.status] || `Status ${s.status}`
      ) || [],
    datasets: [
      {
        label: 'Số lượng',
        data: stats.statusStats?.map((s: any) => s.count) || [],
        backgroundColor:
          stats.statusStats?.map(
            (s: any) => PAYMENT_STATUS_COLORS[s.status] || 'rgba(0,0,0,0.5)'
          ) || [],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  // Line Chart - Daily Revenue (30 days)
  const dailyRevenueData = {
    labels: stats.dailyRevenue?.map((d: any) => d.date) || [],
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: stats.dailyRevenue?.map((d: any) => d.revenue) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Bar Chart - Monthly Revenue (12 months)
  const monthlyRevenueData = {
    labels: stats.monthlyRevenue?.map((m: any) => m.month) || [],
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: stats.monthlyRevenue?.map((m: any) => m.revenue) || [],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return value.toLocaleString() + 'đ';
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng doanh thu
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.totalRevenue || 0).toLocaleString()}đ
            </div>
            <p className="text-xs text-muted-foreground">
              Tất cả giao dịch thành công
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Doanh thu tháng này
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.monthRevenue || 0).toLocaleString()}đ
            </div>
            <p className="text-xs text-muted-foreground">
              Từ đầu tháng đến nay
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng giao dịch
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalPayments || 0}
            </div>
            <p className="text-xs text-muted-foreground">Tất cả trạng thái</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Giao dịch thành công
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.successPayments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalPayments > 0
                ? `${((stats.successPayments / stats.totalPayments) * 100).toFixed(1)}% tổng số`
                : '0%'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bổ theo trạng thái</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Doughnut data={statusChartData} options={doughnutOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Daily Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu 30 ngày gần nhất</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Line data={dailyRevenueData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue */}
      <Card>
        <CardHeader>
          <CardTitle>Doanh thu theo tháng (12 tháng)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <Bar data={monthlyRevenueData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
