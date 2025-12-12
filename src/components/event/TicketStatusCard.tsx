import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Receipt, AlertCircle } from 'lucide-react';

interface TicketStatusCardProps {
  ticketStatus: {
    hasTicket: boolean;
    paymentStatus?: number;
    isExpired?: boolean;
    minutesRemaining?: number;
    paymentUrl?: string;
  };
  onPayNow: (url: string) => void;
  onRegisterAgain: () => void;
}

export default function TicketStatusCard({
  ticketStatus,
  onPayNow,
  onRegisterAgain
}: TicketStatusCardProps) {
  const formatTimeRemaining = (minutes: number) => {
    if (minutes <= 0) return 'Đã hết hạn';
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (!ticketStatus.hasTicket) return null;

  // Payment successful
  if (ticketStatus.paymentStatus === 0) {
    return (
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-green-900">Vé của bạn</h3>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <p className="text-center text-lg font-bold text-green-900">
                Đã thanh toán
              </p>
              <p className="text-center text-sm text-green-700">
                Bạn đã sở hữu vé sự kiện này
              </p>
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                <div className="text-xs text-green-800">
                  <p className="font-medium">Thông tin quan trọng:</p>
                  <ul className="mt-1 space-y-0.5">
                    <li>• Vé đã được gửi qua email</li>
                    <li>• Link tham gia sẽ mở trước sự kiện</li>
                    <li>• Kiểm tra email để xem chi tiết</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ticket expired
  if (ticketStatus.isExpired) {
    return (
      <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Vé đã hết hạn</h3>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <Clock className="mx-auto mb-2 h-8 w-8 text-red-500" />
              <p className="mb-1 font-semibold text-red-900">
                Thời gian giữ vé đã hết
              </p>
              <p className="text-sm text-red-700">
                Vé chỉ được giữ trong 1 giờ
              </p>
            </div>

            <Button
              onClick={onRegisterAgain}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              Đăng ký lại
            </Button>

            <p className="text-center text-xs text-slate-500">
              Mỗi người chỉ được mua 1 vé
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pending payment
  return (
    <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-600" />
          <h3 className="font-semibold text-amber-900">Vé của bạn</h3>
        </div>

        <div className="space-y-3">
          {/* Ticket Card */}
          <div className="rounded-xl bg-white p-4 shadow-md">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-amber-900">
                Chờ thanh toán
              </span>
              <Badge className="animate-pulse bg-amber-600 text-white">
                <Clock className="mr-1 h-3 w-3" />
                {formatTimeRemaining(ticketStatus.minutesRemaining || 0)}
              </Badge>
            </div>

            <div className="mb-3 rounded-lg bg-amber-50 p-3">
              <p className="text-center text-xs text-amber-800">
                Vé sẽ tự động hủy sau{' '}
                <span className="font-bold">
                  {ticketStatus.minutesRemaining} phút
                </span>
              </p>
            </div>

            <Button
              onClick={() => onPayNow(ticketStatus.paymentUrl || '')}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 font-semibold hover:from-orange-600 hover:to-amber-600"
            >
              <Receipt className="mr-2 h-4 w-4" />
              Thanh toán ngay
            </Button>
          </div>

          {/* Info */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
              <div className="text-xs text-amber-800">
                <p className="font-medium">Lưu ý:</p>
                <ul className="mt-1 space-y-0.5">
                  <li>• Hoàn tất thanh toán trong 1 giờ</li>
                  <li>• Mỗi người chỉ được mua 1 vé</li>
                  <li>• Vé sẽ gửi qua email sau thanh toán</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
