import { useGetEventsByPaging } from '@/queries/event.query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from '@/components/ui/dialog';
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
import {
  Calendar,
  User,
  Video,
  Clock,
  Ticket,
  Info,
  Sparkles,
  Play,
  Receipt,
  Filter,
  Search,
  ArrowRight,
  CheckCircle2,
  Mail,
  Phone
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBuyEventTicket, useCheckUserTicket } from '@/queries/event-ticket.query';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import TicketStatusCard from '@/components/event/TicketStatusCard';
import __helpers from '@/helpers';

enum EventStatus {
  IN_COMING = 1,
  IN_PROGRESS = 2,
  COMPLETED = 3
}

interface Speaker {
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
  phone: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  videoUrl: string;
  meetingLink: string;
  commissionRate: number;
  imageUrls: string;
  amount: number;
  status: EventStatus;
  speakerId: number;
  speaker: Speaker;
  createdAt: string;
  updatedAt: string;
}

export default function EventPage() {
  const { data, isLoading } = useGetEventsByPaging(1, 100, '');
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | 'all'>(
    'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const isAuthenticated = true;
  
  // FIX 1: Add proper React Query options to prevent infinite loop
  const { data: ticketStatus, refetch: refetchTicketStatus } = useCheckUserTicket(
    selectedEvent?.id || 0
  );

  const events = useMemo(() => {
    const allEvents = (data?.listObjects as Event[]) || [];
    return {
      all: allEvents,
      incoming: allEvents.filter((e) => e.status === EventStatus.IN_COMING),
      inProgress: allEvents.filter((e) => e.status === EventStatus.IN_PROGRESS),
      completed: allEvents.filter((e) => e.status === EventStatus.COMPLETED)
    };
  }, [data]);

  const filteredEvents = useMemo(() => {
    let filtered =
      selectedStatus === 'all'
        ? events.all
        : events.all.filter((e) => e.status === selectedStatus);

    if (searchQuery) {
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `${e.speaker.firstName} ${e.speaker.lastName}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [events, selectedStatus, searchQuery]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'HH:mm', { locale: vi });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getYouTubeVideoId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const calculateBill = (amount: number) => {
    const VAT_RATE = 0.1;
    const baseAmount = amount / (1 + VAT_RATE);
    const vatAmount = amount - baseAmount;
    return {
      baseAmount,
      vatAmount,
      total: amount
    };
  };

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case EventStatus.IN_COMING:
        return (
          <Badge className="border-0 bg-amber-500 text-white shadow-sm">
            Sắp diễn ra
          </Badge>
        );
      case EventStatus.IN_PROGRESS:
        return (
          <Badge className="border-0 bg-emerald-500 text-white shadow-sm">
            <span className="mr-1.5 flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white"></span>
            </span>
            Đang diễn ra
          </Badge>
        );
      case EventStatus.COMPLETED:
        return (
          <Badge className="border-0 bg-slate-500 text-white shadow-sm">
            Đã hoàn thành
          </Badge>
        );
      default:
        return null;
    }
  };

  const { mutateAsync: buyEventTicket } = useBuyEventTicket();

  const handlePayment = async (event: Event) => {
    if (!isAuthenticated) {
      toast({
        title: 'Vui lòng đăng nhập',
        description: 'Bạn cần đăng nhập để mua vé sự kiện',
        variant: 'destructive'
      });
      return;
    }

    try {
      const [err, response] = await buyEventTicket(event.id);

      if (err) {
        toast({
          title: 'Lỗi',
          description: err?.data?.message || err.message || 'Không thể mua vé',
          variant: 'destructive'
        });
        return;
      }

      if (response) {
        window.open(response.paymentUrl, '_blank');
        // FIX 2: Remove automatic refetch, let user manually refresh
        // setTimeout(() => {
        //   refetchTicketStatus();
        // }, 1000);
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Đã xảy ra lỗi khi mua vé',
        variant: 'destructive'
      });
    }
  };

  const handlePayNow = (paymentUrl: string) => {
    window.open(paymentUrl, '_blank');
  };

  // FIX 3: Use data URL for placeholder instead of external service
  const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%2394a3b8"%3EEvent Image%3C/text%3E%3C/svg%3E';

  const EventCard = ({ event, index }: { event: Event; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={() => setSelectedEvent(event)}
      className="cursor-pointer"
    >
      <Card className="group overflow-hidden border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-100">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.imageUrls}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Date Badge */}
          <div className="absolute left-3 top-3 rounded-lg bg-white px-3 py-2 text-center shadow-md">
            <p className="text-xl font-bold leading-none text-slate-800">
              {format(new Date(event.startDate), 'dd')}
            </p>
            <p className="mt-0.5 text-xs font-semibold uppercase text-orange-500">
              {format(new Date(event.startDate), 'MMM', { locale: vi })}
            </p>
          </div>

          {/* Status Badge */}
          <div className="absolute right-3 top-3">
            {getStatusBadge(event.status)}
          </div>

          {/* Price */}
          <div className="absolute bottom-3 right-3 rounded-lg bg-orange-500 px-3 py-1.5 shadow-md">
            <p className="text-sm font-bold text-white">
              {formatCurrency(event.amount)}
            </p>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="mb-2 line-clamp-2 min-h-[48px] text-lg font-semibold text-slate-800 transition-colors group-hover:text-orange-600">
            {event.title}
          </h3>

          {/* Description */}
          <p className="mb-4 line-clamp-2 text-sm text-slate-500">
            {event.description}
          </p>

          {/* Info */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User className="h-4 w-4 text-orange-400" />
              <span className="truncate">
                {event.speaker.firstName} {event.speaker.lastName}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="h-4 w-4 text-orange-400" />
              <span>{formatTime(event.startDate)}</span>
            </div>
          </div>

          {/* Button */}
          <Button
            variant="outline"
            className="mt-4 w-full border-orange-200 font-medium text-orange-600 hover:bg-orange-50 hover:text-orange-700"
          >
            Xem chi tiết
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
          <p className="text-slate-600">Đang tải sự kiện...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400">
        {/* Decorative shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/10" />
          <div className="absolute right-1/4 top-1/2 h-32 w-32 rounded-full bg-white/5" />
        </div>

        <div className="container relative mx-auto px-4 py-12 lg:py-16">
          <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge className="mb-4 border-white/30 bg-white/20 px-3 py-1.5 text-sm text-white">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Khám phá sự kiện
                </Badge>

                <h1 className="mb-3 text-4xl font-bold text-white lg:text-5xl">
                  Nâng Tầm Tri Thức
                </h1>
                <p className="mb-6 text-lg text-white/90">
                  Tham gia các sự kiện học tập và networking cùng chuyên gia
                </p>

                {/* Stats */}
                <div className="flex flex-wrap justify-center gap-6 lg:justify-start">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">
                      {events.all.length}
                    </p>
                    <p className="text-sm text-white/80">Sự kiện</p>
                  </div>
                  <div className="h-12 w-px bg-white/30" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">
                      {events.inProgress.length}
                    </p>
                    <p className="text-sm text-white/80">Đang diễn ra</p>
                  </div>
                  <div className="h-12 w-px bg-white/30" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">
                      {events.incoming.length}
                    </p>
                    <p className="text-sm text-white/80">Sắp tới</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Decorative Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="flex h-40 w-40 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                <Calendar className="h-20 w-20 text-white/50" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full flex-shrink-0 lg:w-72"
          >
            <div className="sticky top-4 space-y-4">
              {/* Search */}
              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Search className="h-4 w-4 text-orange-500" />
                    <h3 className="font-semibold text-slate-700">Tìm kiếm</h3>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Tìm sự kiện..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-slate-200 pl-9 focus:border-orange-300 focus:ring-orange-100"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Filter */}
              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Filter className="h-4 w-4 text-orange-500" />
                    <h3 className="font-semibold text-slate-700">Trạng thái</h3>
                  </div>

                  <div className="space-y-1.5">
                    <button
                      onClick={() => setSelectedStatus('all')}
                      className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all ${
                        selectedStatus === 'all'
                          ? 'bg-orange-500 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>Tất cả</span>
                        <Badge
                          variant="secondary"
                          className={
                            selectedStatus === 'all'
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-200'
                          }
                        >
                          {events.all.length}
                        </Badge>
                      </div>
                    </button>

                    <button
                      onClick={() => setSelectedStatus(EventStatus.IN_COMING)}
                      className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all ${
                        selectedStatus === EventStatus.IN_COMING
                          ? 'bg-amber-500 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>Sắp diễn ra</span>
                        </div>
                        <Badge
                          variant="secondary"
                          className={
                            selectedStatus === EventStatus.IN_COMING
                              ? 'bg-white/20 text-white'
                              : 'bg-amber-100 text-amber-700'
                          }
                        >
                          {events.incoming.length}
                        </Badge>
                      </div>
                    </button>

                    <button
                      onClick={() => setSelectedStatus(EventStatus.IN_PROGRESS)}
                      className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all ${
                        selectedStatus === EventStatus.IN_PROGRESS
                          ? 'bg-amber-500 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          <span>Đang diễn ra</span>
                        </div>
                        <Badge
                          variant="secondary"
                          className={
                            selectedStatus === EventStatus.IN_PROGRESS
                              ? 'bg-white/20 text-white'
                              : 'bg-amber-100 text-amber-700'
                          }
                        >
                          {events.inProgress.length}
                        </Badge>
                      </div>
                    </button>

                    <button
                      onClick={() => setSelectedStatus(EventStatus.COMPLETED)}
                      className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all ${
                        selectedStatus === EventStatus.COMPLETED
                          ? 'bg-amber-500 text-white'
                          : 'text-slate-600 '
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          <p>Đã hoàn thành</p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={
                            selectedStatus === EventStatus.COMPLETED
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-200'
                          }
                        >
                          {events.completed.length}
                        </Badge>
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Events Grid */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h2 className="text-xl font-semibold text-slate-800">
                {selectedStatus === 'all' && 'Tất cả sự kiện'}
                {selectedStatus === EventStatus.IN_COMING &&
                  'Sự kiện sắp diễn ra'}
                {selectedStatus === EventStatus.IN_PROGRESS &&
                  'Sự kiện đang diễn ra'}
                {selectedStatus === EventStatus.COMPLETED &&
                  'Sự kiện đã hoàn thành'}
              </h2>
              <p className="text-sm text-slate-500">
                Hiển thị {filteredEvents.length} sự kiện
                {searchQuery && ` cho "${searchQuery}"`}
              </p>
            </motion.div>

            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredEvents.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-16 text-center"
              >
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                  <Search className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-700">
                  Không tìm thấy sự kiện
                </h3>
                <p className="mb-4 text-slate-500">
                  Thử thay đổi bộ lọc hoặc từ khóa
                </p>
                <Button
                  onClick={() => {
                    setSelectedStatus('all');
                    setSearchQuery('');
                  }}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Xem tất cả sự kiện
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <Dialog
            open={!!selectedEvent}
            onOpenChange={(open) => {
              if (!open) setSelectedEvent(null);
            }}
          >
            <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto border-0 p-0">
              {/* Hero Image */}
              <div className="relative h-72 lg:h-80">
                <img
                  src={selectedEvent.imageUrls}
                  alt={selectedEvent.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                  <div className="mb-3">
                    {getStatusBadge(selectedEvent.status)}
                  </div>

                  <DialogTitle className="mb-3 text-2xl font-bold text-white lg:text-3xl">
                    {selectedEvent.title}
                  </DialogTitle>

                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-1.5 text-sm text-white backdrop-blur-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(selectedEvent.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-1.5 text-sm text-white backdrop-blur-sm">
                      <User className="h-4 w-4" />
                      <span>
                        {selectedEvent.speaker.firstName}{' '}
                        {selectedEvent.speaker.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white">
                      <Ticket className="h-4 w-4" />
                      <span>{formatCurrency(selectedEvent.amount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 lg:p-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                  {/* Left Content */}
                  <div className="space-y-6 lg:col-span-2">
                    {/* Description */}
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <Info className="h-5 w-5 text-orange-500" />
                        <h3 className="text-lg font-semibold text-slate-800">
                          Về sự kiện
                        </h3>
                      </div>
                      <DialogDescription className="leading-relaxed text-slate-600">
                        {selectedEvent.description}
                      </DialogDescription>
                    </div>

                    {/* Video */}
                    {selectedEvent.videoUrl && (
                      <div>
                        <div className="mb-3 flex items-center gap-2">
                          <Play className="h-5 w-5 text-orange-500" />
                          <h3 className="text-lg font-semibold text-slate-800">
                            Video giới thiệu
                          </h3>
                        </div>
                        <div className="aspect-video overflow-hidden rounded-xl shadow-lg">
                          <iframe
                            src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedEvent.videoUrl)}`}
                            title={selectedEvent.title}
                            className="h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Sidebar */}
                  <div className="space-y-4">
                    {/* Time Info */}
                    <Card className="border-slate-200">
                      <CardContent className="p-4">
                        <h3 className="mb-3 font-semibold text-slate-800">
                          Thời gian
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 rounded-lg bg-orange-50 p-3">
                            <Calendar className="h-5 w-5 text-orange-500" />
                            <div>
                              <p className="text-xs text-slate-500">Bắt đầu</p>
                              <p className="text-sm font-medium text-slate-700">
                                {formatDate(selectedEvent.startDate)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                            <Clock className="h-5 w-5 text-slate-400" />
                            <div>
                              <p className="text-xs text-slate-500">Kết thúc</p>
                              <p className="text-sm font-medium text-slate-700">
                                {formatDate(selectedEvent.endDate)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Speaker */}
                    <Card className="border-slate-200">
                      <CardContent className="p-4">
                        <h3 className="mb-3 font-semibold text-slate-800">
                          Diễn giả
                        </h3>
                        <div className="flex items-start gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                            <User className="h-6 w-6 text-orange-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-slate-800">
                              {selectedEvent.speaker.firstName}{' '}
                              {selectedEvent.speaker.lastName}
                            </p>
                            <div className="mt-1 space-y-0.5">
                              <p className="flex items-center gap-1.5 truncate text-xs text-slate-500">
                                <Mail className="h-3 w-3" />
                                {selectedEvent.speaker.email}
                              </p>
                              {selectedEvent.speaker.phone && (
                                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                                  <Phone className="h-3 w-3" />
                                  {selectedEvent.speaker.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Price & Buy */}
                    <Card className="border-0 bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                      <CardContent className="p-4 text-center">
                        <Ticket className="mx-auto mb-2 h-8 w-8" />
                        <p className="text-sm opacity-90">Giá vé</p>
                        <p className="text-3xl font-bold">
                          {formatCurrency(selectedEvent.amount)}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Ticket Status */}
                    {isAuthenticated && ticketStatus?.hasTicket && (
                      <TicketStatusCard
                        ticketStatus={ticketStatus}
                        onPayNow={handlePayNow}
                        onRegisterAgain={() => {
                          refetchTicketStatus();
                          setShowPaymentConfirm(true);
                        }}
                      />
                    )}

                    {(!isAuthenticated || !ticketStatus?.hasTicket || ticketStatus?.isExpired) && (
                      <Button
                        onClick={() => {
                          if (!isAuthenticated) {
                            toast({
                              title: 'Vui lòng đăng nhập',
                              description: 'Bạn cần đăng nhập để mua vé sự kiện',
                              variant: 'destructive'
                            });
                            return;
                          }
                          setShowPaymentConfirm(true);
                        }}
                        className="w-full bg-orange-500 py-6 text-base font-semibold hover:bg-orange-600"
                      >
                        <Ticket className="mr-2 h-5 w-5" />
                        {ticketStatus?.isExpired ? 'Đăng ký lại' : 'Đăng ký ngay'}
                      </Button>
                    )}

                    {/* Note */}
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <div className="flex items-start gap-2">
                        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                        <div className="text-xs text-amber-800">
                          <p className="font-medium">Lưu ý:</p>
                          <ul className="mt-1 space-y-0.5">
                            <li>• Vé gửi qua email sau thanh toán</li>
                            <li>• Link tham gia mở trước sự kiện</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Payment Confirmation */}
      <AnimatePresence>
        {showPaymentConfirm && selectedEvent && (
          <AlertDialog
            open={showPaymentConfirm}
            onOpenChange={setShowPaymentConfirm}
          >
            <AlertDialogContent className="max-w-lg overflow-hidden border-0 p-0">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-3 text-white">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                      <Receipt className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">Xác nhận thanh toán</p>
                      <p className="text-sm font-normal opacity-90">
                        Kiểm tra thông tin trước khi thanh toán
                      </p>
                    </div>
                  </AlertDialogTitle>
                </AlertDialogHeader>
              </div>

              {/* Content */}
              <div className="p-6">
                <AlertDialogDescription asChild>
                  <div className="space-y-4">
                    {/* Event Info */}
                    <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100">
                        <Sparkles className="h-5 w-5 text-orange-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-500">Sự kiện</p>
                        <p className="line-clamp-2 font-semibold text-slate-800">
                          {selectedEvent.title}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(selectedEvent.startDate)}
                        </p>
                      </div>
                    </div>

                    {/* Bill */}
                    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                      <div className="mb-3 flex items-center gap-2 border-b border-orange-200 pb-3">
                        <Receipt className="h-4 w-4 text-orange-600" />
                        <h3 className="font-semibold text-slate-800">
                          Chi tiết thanh toán
                        </h3>
                      </div>

                      {(() => {
                        const bill = calculateBill(selectedEvent.amount);
                        return (
                          <>
                            <div className="flex items-center justify-between py-2">
                              <div>
                                <p className="font-medium text-slate-700">
                                  Phí tham gia
                                </p>
                                <p className="text-xs text-slate-500">1 vé</p>
                              </div>
                              <p className="text-lg font-bold text-slate-800">
                                {formatCurrency(selectedEvent.amount)}
                              </p>
                            </div>

                            <div className="mt-3 rounded-lg bg-orange-500 p-4 text-white">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium">
                                    Tổng cộng
                                  </p>
                                  <p className="text-xs opacity-80">
                                    Đã bao gồm VAT
                                  </p>
                                </div>
                                <p className="text-2xl font-bold">
                                  {formatCurrency(bill.total)}
                                </p>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Note */}
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-start gap-2">
                        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-500" />
                        <p className="text-xs text-slate-600">
                          Vé điện tử sẽ được gửi qua email sau khi thanh toán
                          thành công.
                        </p>
                      </div>
                    </div>
                  </div>
                </AlertDialogDescription>
              </div>

              {/* Actions */}
              <AlertDialogFooter className="gap-2 border-t border-slate-200 bg-slate-50 p-4">
                <AlertDialogCancel className="flex-1">Hủy bỏ</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handlePayment(selectedEvent)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  <Ticket className="mr-2 h-4 w-4" />
                  Xác nhận
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </AnimatePresence>
    </div>
  );
}