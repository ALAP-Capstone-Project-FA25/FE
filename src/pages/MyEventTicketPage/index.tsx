import {
  useGetMyTickets,
  useBuyEventTicket
} from '@/queries/event-ticket.query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EventTicket, PaymentStatus, TFUResponse } from '@/types/api.types';
import {
  Calendar,
  Clock,
  CreditCard,
  ExternalLink,
  MapPin,
  Ticket,
  AlertCircle,
  CheckCircle2,
  Filter,
  XCircle,
  DollarSign,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { cn } from '@/lib/utils';

enum EventStatus {
  IN_COMING = 1,
  IN_PROGRESS = 2,
  COMPLETED = 3,
  CANCELLED = 4
}

type GroupedEventTickets = {
  eventId: number;
  event: EventTicket['event'];
  tickets: EventTicket[];
};

export default function MyEventTicketPage() {
  const { data, isLoading, refetch } = useGetMyTickets();
  const buyTicketMutation = useBuyEventTicket();

  const [selectedStatus, setSelectedStatus] = useState<EventStatus | null>(
    EventStatus.IN_PROGRESS
  );
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>(
    'all'
  );

  const tickets: EventTicket[] = (data as EventTicket[]) || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PENDING:
        return (
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-50 text-amber-700"
          >
            <AlertCircle className="mr-1 h-3 w-3" />
            Chờ thanh toán
          </Badge>
        );
      case PaymentStatus.SUCCESS:
        return (
          <Badge
            variant="outline"
            className="border-emerald-200 bg-emerald-50 text-emerald-700"
          >
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Đã thanh toán
          </Badge>
        );
      case PaymentStatus.CANCELLED:
        return (
          <Badge
            variant="outline"
            className="border-red-200 bg-red-50 text-red-700"
          >
            Đã hủy
          </Badge>
        );
      case PaymentStatus.EXPIRED:
        return (
          <Badge
            variant="outline"
            className="border-slate-200 bg-slate-50 text-slate-600"
          >
            Hết hạn
          </Badge>
        );
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const getEventStatusCount = (status: EventStatus | null) => {
    if (status === null) return tickets.length;
    return tickets.filter((ticket) => ticket.event.status === status).length;
  };

  const handleRetryPayment = async (ticket: EventTicket) => {
    try {
      const response = await buyTicketMutation.mutateAsync(ticket.eventId);
      const result = response as unknown as TFUResponse<{ paymentUrl: string }>;

      if (result.success && result.data?.paymentUrl) {
        window.open(result.data.paymentUrl, '_blank');
        toast.success('Đã tạo đơn thanh toán mới');
        refetch();
      } else {
        toast.error(result.message || 'Không thể tạo đơn thanh toán');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tạo đơn thanh toán');
    }
  };

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    const statusMatch =
      selectedStatus === null || ticket.event.status === selectedStatus;
    const paymentMatch =
      paymentFilter === 'all' ||
      (paymentFilter === 'paid' && ticket.isActive) ||
      (paymentFilter === 'unpaid' && !ticket.isActive);

    return statusMatch && paymentMatch;
  });

  // Group tickets by event
  const groupedTickets: GroupedEventTickets[] = Object.values(
    filteredTickets.reduce(
      (acc, ticket) => {
        const key = ticket.eventId.toString();
        if (!acc[key]) {
          acc[key] = {
            eventId: ticket.eventId,
            event: ticket.event,
            tickets: []
          };
        }
        acc[key].tickets.push(ticket);
        return acc;
      },
      {} as Record<string, GroupedEventTickets>
    )
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex h-[60vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500"></div>
              <p className="text-lg text-slate-600">Đang tải vé của bạn...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800">
            Vé sự kiện của tôi
          </h1>
          <p className="mt-2 text-slate-600">
            Quản lý và theo dõi các vé sự kiện của bạn
          </p>
        </div>

        {/* Main Layout */}
        <div className="flex gap-6">
          {/* Sidebar - 30% */}
          <div className="w-[30%] space-y-4">
            {/* Event Status Filter */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  Danh sách vé theo sự kiện
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button
                  onClick={() => setSelectedStatus(null)}
                  className={cn(
                    'w-full rounded-lg px-4 py-3 text-left transition-all duration-200',
                    selectedStatus === null
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Tất cả</span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        selectedStatus === null
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-700'
                      )}
                    >
                      {getEventStatusCount(null)}
                    </Badge>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedStatus(EventStatus.IN_COMING)}
                  className={cn(
                    'w-full rounded-lg px-4 py-3 text-left transition-all duration-200',
                    selectedStatus === EventStatus.IN_COMING
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Sắp diễn ra</span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        selectedStatus === EventStatus.IN_COMING
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-700'
                      )}
                    >
                      {getEventStatusCount(EventStatus.IN_COMING)}
                    </Badge>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedStatus(EventStatus.IN_PROGRESS)}
                  className={cn(
                    'w-full rounded-lg px-4 py-3 text-left transition-all duration-200',
                    selectedStatus === EventStatus.IN_PROGRESS
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Đang diễn ra</span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        selectedStatus === EventStatus.IN_PROGRESS
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-700'
                      )}
                    >
                      {getEventStatusCount(EventStatus.IN_PROGRESS)}
                    </Badge>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedStatus(EventStatus.COMPLETED)}
                  className={cn(
                    'w-full rounded-lg px-4 py-3 text-left transition-all duration-200',
                    selectedStatus === EventStatus.COMPLETED
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Đã kết thúc</span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        selectedStatus === EventStatus.COMPLETED
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-700'
                      )}
                    >
                      {getEventStatusCount(EventStatus.COMPLETED)}
                    </Badge>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedStatus(EventStatus.CANCELLED)}
                  className={cn(
                    'w-full rounded-lg px-4 py-3 text-left transition-all duration-200',
                    selectedStatus === EventStatus.CANCELLED
                      ? 'bg-red-500 text-white shadow-md'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Đã hủy</span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        selectedStatus === EventStatus.CANCELLED
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-700'
                      )}
                    >
                      {getEventStatusCount(EventStatus.CANCELLED)}
                    </Badge>
                  </div>
                </button>
              </CardContent>
            </Card>

            {/* Payment Status Filter */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Filter className="h-5 w-5 text-orange-500" />
                  Trạng thái thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button
                  onClick={() => setPaymentFilter('all')}
                  className={cn(
                    'w-full rounded-lg px-4 py-3 text-left transition-all duration-200',
                    paymentFilter === 'all'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  )}
                >
                  <span className="font-medium">Tất cả</span>
                </button>

                <button
                  onClick={() => setPaymentFilter('paid')}
                  className={cn(
                    'w-full rounded-lg px-4 py-3 text-left transition-all duration-200',
                    paymentFilter === 'paid'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">Đã thanh toán</span>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentFilter('unpaid')}
                  className={cn(
                    'w-full rounded-lg px-4 py-3 text-left transition-all duration-200',
                    paymentFilter === 'unpaid'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Chưa thanh toán</span>
                  </div>
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Content - 70% */}
          <div className="w-[70%]">
            {groupedTickets.length === 0 ? (
              <Card className="border-none shadow-lg">
                <CardContent className="flex h-96 flex-col items-center justify-center">
                  <div className="mb-4 rounded-full bg-orange-100 p-6">
                    <Ticket className="h-16 w-16 text-orange-500" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-slate-800">
                    Không tìm thấy vé
                  </h3>
                  <p className="text-center text-slate-600">
                    Không có vé nào phù hợp với bộ lọc hiện tại
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    Hiển thị {groupedTickets.length} sự kiện (
                    {filteredTickets.length} vé)
                  </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {groupedTickets.map((group) => {
                    const { event, tickets: eventTickets } = group;
                    const hasActiveTicket = eventTickets.some(
                      (t) => t.isActive
                    );

                    return (
                      <Card
                        key={group.eventId}
                        className="group overflow-hidden border-none shadow-md transition-all duration-300 hover:shadow-xl"
                      >
                        {event.imageUrls && (
                          <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                            <img
                              src={event.imageUrls}
                              alt={event.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />

                            {/* Status Badge Overlay */}
                            <div className="absolute left-3 top-3 flex gap-2">
                              {event.status === EventStatus.CANCELLED ? (
                                <Badge className="border-none bg-red-500 text-white shadow-lg">
                                  <XCircle className="mr-1 h-3 w-3" />
                                  Sự kiện đã hủy
                                </Badge>
                              ) : hasActiveTicket ? (
                                <Badge className="border-none bg-emerald-500 text-white shadow-lg">
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  Khả dụng
                                </Badge>
                              ) : (
                                <Badge className="border-none bg-slate-500 text-white shadow-lg">
                                  <AlertCircle className="mr-1 h-3 w-3" />
                                  Chưa khả dụng
                                </Badge>
                              )}
                            </div>

                            {/* Gradient Overlay */}
                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent"></div>
                          </div>
                        )}

                        <CardHeader className="pb-3">
                          <CardTitle className="line-clamp-2 text-lg text-slate-800">
                            {event.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2 text-sm">
                            {event.description}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4 pb-4">
                          {/* Event Details */}
                          <div className="space-y-3">
                            <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                              <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" />
                              <div className="flex-1 space-y-0.5">
                                <div className="text-xs font-medium text-slate-600">
                                  Bắt đầu
                                </div>
                                <div className="text-sm text-slate-800">
                                  {formatDate(event.startDate)}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                              <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" />
                              <div className="flex-1 space-y-0.5">
                                <div className="text-xs font-medium text-slate-600">
                                  Kết thúc
                                </div>
                                <div className="text-sm text-slate-800">
                                  {formatDate(event.endDate)}
                                </div>
                              </div>
                            </div>

                            {/* Meeting Link */}
                            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                              <MapPin className="h-4 w-4 flex-shrink-0 text-orange-500" />
                              {hasActiveTicket && event.meetingLink ? (
                                <a
                                  href={event.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-sm font-medium text-orange-600 transition-colors hover:text-orange-700"
                                >
                                  Tham gia sự kiện
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              ) : (
                                <span className="text-sm text-slate-500">
                                  Link chưa khả dụng
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Tickets List */}
                          <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-600">
                                Số lượng vé
                              </span>
                              <span className="text-sm font-semibold text-slate-800">
                                {eventTickets.length} vé
                              </span>
                            </div>

                            <div className="space-y-3">
                              {eventTickets.map((ticket) => (
                                <div
                                  key={ticket.id}
                                  className={cn(
                                    "space-y-2 rounded-lg p-3",
                                    ticket.needRefund 
                                      ? "bg-red-50 border border-red-200" 
                                      : "bg-slate-50"
                                  )}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-600">
                                      Mã thanh toán
                                    </span>
                                    <span className="font-mono text-sm text-slate-800">
                                      {ticket.payment.code}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-600">
                                      Số tiền
                                    </span>
                                    <span className="text-base font-semibold text-orange-600">
                                      {formatCurrency(ticket.payment.amount)}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-600">
                                      Trạng thái
                                    </span>
                                    {getPaymentStatusBadge(
                                      ticket.payment.paymentStatus
                                    )}
                                  </div>

                                  {/* Refund Information */}
                                  {ticket.needRefund && (
                                    <div className="mt-3 space-y-2 border-t border-red-200 pt-3">
                                      <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-red-600" />
                                        <span className="text-sm font-semibold text-red-700">
                                          Thông tin hoàn tiền
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-600">
                                          Trạng thái hoàn tiền
                                        </span>
                                        {ticket.isRefunded ? (
                                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                            Đã hoàn tiền
                                          </Badge>
                                        ) : (
                                          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                            <Clock className="mr-1 h-3 w-3" />
                                            Đang xử lý
                                          </Badge>
                                        )}
                                      </div>

                                      {ticket.isRefunded && ticket.refundImageUrl && (
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2">
                                            <ImageIcon className="h-3 w-3 text-slate-600" />
                                            <span className="text-xs text-slate-600">
                                              Chứng từ hoàn tiền
                                            </span>
                                          </div>
                                          <a
                                            href={ticket.refundImageUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block overflow-hidden rounded-lg border border-slate-200"
                                          >
                                            <img
                                              src={ticket.refundImageUrl}
                                              alt="Chứng từ hoàn tiền"
                                              className="h-32 w-full object-cover transition-transform hover:scale-105"
                                            />
                                          </a>
                                        </div>
                                      )}

                                      {!ticket.isRefunded && (
                                        <div className="rounded-lg bg-yellow-50 p-2">
                                          <p className="text-xs text-yellow-800">
                                            💡 Chúng tôi đang xử lý hoàn tiền cho bạn. Bạn sẽ nhận được email xác nhận khi hoàn tiền hoàn tất.
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {!ticket.needRefund && ticket.payment.paymentStatus ===
                                      PaymentStatus.PENDING && (
                                      <>
                                        <Button
                                          size="sm"
                                          className="flex-1 bg-orange-500 text-white hover:bg-orange-600"
                                          onClick={() =>
                                            window.open(
                                              ticket.payment.paymentUrl,
                                              '_blank'
                                            )
                                          }
                                        >
                                          <CreditCard className="mr-2 h-4 w-4" />
                                          Thanh toán ngay
                                        </Button>
                                      </>
                                    )}

                                    {!ticket.needRefund && ticket.payment.paymentStatus ===
                                      PaymentStatus.SUCCESS && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full border-emerald-200 bg-emerald-50 text-emerald-700"
                                        disabled
                                      >
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Đã thanh toán
                                      </Button>
                                    )}

                                    {!ticket.needRefund && ticket.payment.paymentStatus ===
                                      PaymentStatus.CANCELLED && (
                                      <Button
                                        size="sm"
                                        className="w-full bg-orange-500 text-white hover:bg-orange-600"
                                        onClick={() =>
                                          handleRetryPayment(ticket)
                                        }
                                        disabled={buyTicketMutation.isPending}
                                      >
                                        Mua lại
                                      </Button>
                                    )}

                                    {!ticket.needRefund && ticket.payment.paymentStatus ===
                                      PaymentStatus.EXPIRED && (
                                      <Button
                                        size="sm"
                                        className="w-full bg-orange-500 text-white hover:bg-orange-600"
                                        onClick={() =>
                                          handleRetryPayment(ticket)
                                        }
                                        disabled={buyTicketMutation.isPending}
                                      >
                                        Mua lại
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent> 
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
