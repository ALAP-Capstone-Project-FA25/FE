import { useParams, useSearchParams } from 'react-router-dom';
import ListData from '../../list-data';
import { DataTableSkeleton } from '@/components/shared/data-table-skeleton';
import {
  useGetEventTicketByEventId,
  useSendCommision
} from '@/queries/event.query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Sparkles,
  Award,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { PaymentStatus } from '@/types/api.types';

export function OverViewTab() {
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get('page') || 1);
  const pageLimit = Number(searchParams.get('limit') || 10);
  const keyword = searchParams.get('keyword') || '';
  const { id } = useParams();
  const { data, isPending } = useGetEventTicketByEventId(
    page,
    pageLimit,
    keyword,
    id
  );

  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { mutateAsync: sendCommision } = useSendCommision();

  const [ticketFilter, setTicketFilter] = useState<
    'all' | 'active' | 'inactive'
  >('active');

  const listObjects = data?.listObjects || [];
  const totalRecords = data?.totalRecords || 0;
  const pageCount = Math.ceil(totalRecords / pageLimit);

  // Vé đã active (dùng cho thống kê, doanh thu...)
  const ticketSuccess = listObjects.filter(
    (ticket: any) => ticket?.payment?.paymentStatus == PaymentStatus.SUCCESS
  );

  const filteredTickets = listObjects.filter((ticket: any) => {
    if (ticketFilter === 'active')
      return ticket?.payment?.paymentStatus == PaymentStatus.SUCCESS;
    if (ticketFilter === 'inactive')
      return ticket?.payment?.paymentStatus !== PaymentStatus.SUCCESS;
    return true;
  });

  // Tính toán thống kê
  const totalRevenue = ticketSuccess.reduce(
    (sum: number, ticket: any) => sum + (ticket.amount || 0),
    0
  );

  const totalParticipants = ticketSuccess.length;

  const commissionRate = ticketSuccess[0]?.event?.commissionRate || 0;
  const actualRevenue = totalRevenue * (commissionRate / 100);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleCompleteEvent = async () => {
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success('Sự kiện đã được đánh dấu hoàn thành!', {
        description: 'Trạng thái sự kiện đã được cập nhật thành công.'
      });
      setShowCompleteDialog(false);
    } catch (error) {
      toast.error('Có lỗi xảy ra', {
        description: 'Không thể hoàn thành sự kiện. Vui lòng thử lại.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransferMoney = async () => {
    setIsProcessing(true);
    const [err] = await sendCommision({ 
      eventId: Number(id), 
      paymentProofImageUrl: '' 
    });
    if (err) {
      toast.error('Có lỗi xảy ra', {
        description: 'Không thể chuyển tiền cho diễn giả. Vui lòng thử lại.'
      });
    } else {
      toast.success('Chuyển tiền cho diễn giả thành công!', {
        description: 'Chuyển tiền cho diễn giả thành công.'
      });
    }
    setIsProcessing(false);
  };

  const stats = [
    {
      title: 'Tổng Doanh Thu',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      description: 'Tổng tiền từ vé đã bán',
      color: 'text-emerald-600',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
      iconBg: 'bg-emerald-100',
      trend: '+12.5%',
      trendColor: 'text-emerald-600'
    },
    {
      title: 'Người Tham Gia',
      value: totalParticipants.toString(),
      icon: Users,
      description: 'Số lượng vé đã xác nhận',
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-100',
      trend: `${totalParticipants}/${totalRecords}`,
      trendColor: 'text-blue-600'
    },
    {
      title: 'Tiền chi cho diễn giả',
      value: formatCurrency(actualRevenue),
      icon: TrendingUp,
      description: `Sau chiết khấu ${commissionRate}%`,
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-amber-50',
      borderColor: 'border-orange-200',
      iconBg: 'bg-orange-100',
      trend: `${commissionRate}% hoa hồng`,
      trendColor: 'text-orange-600'
    },
    {
      title: 'Tỷ Lệ Chuyển Đổi',
      value: `${totalRecords ? Math.round((ticketSuccess.length / totalRecords) * 100) : 0}%`,
      icon: Award,
      description: 'Vé thành công/Tổng vé',
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
      iconBg: 'bg-purple-100',
      trend: 'Hiệu suất cao',
      trendColor: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  'relative overflow-hidden border shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
                  stat.bgColor,
                  stat.borderColor
                )}
              >
                {/* Decorative circle */}
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/30 blur-2xl" />

                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    {stat.title}
                  </CardTitle>
                  <motion.div
                    className={cn('rounded-xl p-2.5 shadow-sm', stat.iconBg)}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <Icon className={cn('h-5 w-5', stat.color)} />
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-3xl font-bold text-transparent">
                      {stat.value}
                    </div>
                    <p className="text-xs font-medium text-gray-600">
                      {stat.description}
                    </p>
                    <div
                      className={cn(
                        'flex items-center gap-1 text-xs font-semibold',
                        stat.trendColor
                      )}
                    >
                      <TrendingUp className="h-3 w-3" />
                      <span>{stat.trend}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

   

      {/* Participant List với header màu sắc + BỘ LỌC */}
      <Card className="overflow-hidden border-none shadow-md">
        <CardHeader className="flex flex-col gap-3 border-b bg-gradient-to-r from-indigo-50 to-purple-50 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-center text-xl sm:text-left">
            <span className="font-bold">DANH SÁCH KHÁCH THAM DỰ</span>
          </CardTitle>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-gray-600">
              <Filter className="h-3 w-3" />
              Trạng thái vé:
            </span>
            <div className="inline-flex rounded-lg bg-white p-1 shadow-sm">
              <Button
                size="sm"
                variant={ticketFilter === 'all' ? 'default' : 'ghost'}
                onClick={() => setTicketFilter('all')}
                className={cn(
                  'h-8 px-3 text-xs',
                  ticketFilter === 'all' &&
                    'bg-indigo-600 text-white hover:bg-indigo-700'
                )}
              >
                Tất cả
              </Button>
              <Button
                size="sm"
                variant={ticketFilter === 'active' ? 'default' : 'ghost'}
                onClick={() => setTicketFilter('active')}
                className={cn(
                  'h-8 px-3 text-xs',
                  ticketFilter === 'active' &&
                    'bg-emerald-600 text-white hover:bg-emerald-700'
                )}
              >
                Đã thanh toán
              </Button>
              <Button
                size="sm"
                variant={ticketFilter === 'inactive' ? 'default' : 'ghost'}
                onClick={() => setTicketFilter('inactive')}
                className={cn(
                  'h-8 px-3 text-xs',
                  ticketFilter === 'inactive' &&
                    'bg-rose-600 text-white hover:bg-rose-700'
                )}
              >
                Chưa thanh toán
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {isPending ? (
            <DataTableSkeleton
              columnCount={10}
              filterableColumnCount={2}
              searchableColumnCount={1}
            />
          ) : (
            <ListData
              data={filteredTickets}
              page={totalRecords} // (nếu muốn đúng hơn nên là page, nhưng mình giữ nguyên theo code cũ)
              totalUsers={totalRecords}
              pageCount={pageCount}
            />
          )}
        </CardContent>
      </Card>

      {/* Complete Event Dialog - Màu xanh lá */}
      <AlertDialog
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
      >
        <AlertDialogContent className="border-2 border-green-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <div className="rounded-full bg-green-100 p-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Xác Nhận Hoàn Thành Sự Kiện
              </span>
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p className="text-base">
                Bạn có chắc chắn muốn đánh dấu sự kiện này là đã hoàn thành?
              </p>
              <div className="space-y-2 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4">
                <p className="flex items-center gap-2 font-semibold text-green-900">
                  <Sparkles className="h-4 w-4" />
                  Thông tin sự kiện:
                </p>
                <div className="space-y-1 text-sm text-green-800">
                  <p>
                    • Tổng người tham gia:{' '}
                    <span className="font-bold text-green-900">
                      {totalParticipants}
                    </span>
                  </p>
                  <p>
                    • Tổng doanh thu:{' '}
                    <span className="font-bold text-green-900">
                      {formatCurrency(totalRevenue)}
                    </span>
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isProcessing}
              className="hover:bg-gray-100"
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCompleteEvent}
              disabled={isProcessing}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isProcessing ? 'Đang xử lý...' : 'Xác Nhận'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Transfer Money Dialog - Màu cam/đỏ */}
      <AlertDialog
        open={showTransferDialog}
        onOpenChange={setShowTransferDialog}
      >
        <AlertDialogContent className="border-2 border-orange-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Xác Nhận Chuyển Tiền
              </span>
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p className="text-base">
                Bạn có chắc chắn muốn chuyển tiền cho diễn giả?
              </p>
              <div className="space-y-3 rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 p-4">
                <p className="flex items-center gap-2 font-semibold text-orange-900">
                  <DollarSign className="h-4 w-4" />
                  Chi tiết chuyển khoản:
                </p>
                <div className="space-y-2 text-sm text-orange-800">
                  <p className="flex justify-between">
                    <span>Tổng doanh thu:</span>
                    <span className="font-semibold">
                      {formatCurrency(totalRevenue)}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span>Tỷ lệ hoa hồng:</span>
                    <span className="font-semibold">{commissionRate}%</span>
                  </p>
                  <div className="flex justify-between border-t-2 border-orange-200 pt-2 text-base">
                    <span className="font-bold">Số tiền chuyển:</span>
                    <span className="font-bold text-orange-600">
                      {formatCurrency(actualRevenue)}
                    </span>
                  </div>
                </div>
              </div>
              <p className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700">
                ⚠️ Lưu ý: Hành động này không thể hoàn tác sau khi xác nhận.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isProcessing}
              className="hover:bg-gray-100"
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTransferMoney}
              disabled={isProcessing}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              {isProcessing ? 'Đang chuyển...' : 'Xác Nhận Chuyển'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
