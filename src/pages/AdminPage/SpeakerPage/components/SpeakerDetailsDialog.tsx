import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Loader2,
  X
} from 'lucide-react';
import { useGetSpeakerDetails } from '@/queries/speaker.query';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface SpeakerDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  speakerId: number | null;
}

export default function SpeakerDetailsDialog({
  open,
  onOpenChange,
  speakerId
}: SpeakerDetailsDialogProps) {
  const { data: speakerDetails, isLoading } = useGetSpeakerDetails(
    speakerId || 0
  );

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (!speakerId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <User className="h-5 w-5 text-orange-500" />
                Chi tiết Speaker
              </DialogTitle>
              <DialogDescription>
                Thông tin chi tiết và thống kê hoạt động của speaker
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <span className="ml-2 text-gray-600">Đang tải thông tin...</span>
          </div>
        ) : speakerDetails ? (
          <div className="space-y-6">
            {/* Speaker Profile Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={speakerDetails.avatar} />
                    <AvatarFallback className="bg-orange-100 text-lg text-orange-600">
                      {getInitials(
                        speakerDetails.firstName,
                        speakerDetails.lastName
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {speakerDetails.firstName} {speakerDetails.lastName}
                        </h3>
                        <p className="mt-1 text-gray-600">Speaker</p>
                      </div>
                      <Badge
                        variant={
                          speakerDetails.isActive ? 'default' : 'secondary'
                        }
                        className={
                          speakerDetails.isActive
                            ? 'bg-green-100 text-green-800'
                            : ''
                        }
                      >
                        {speakerDetails.isActive ? 'Hoạt động' : 'Tạm dừng'}
                      </Badge>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="mr-2 h-4 w-4" />
                        <span>{speakerDetails.email}</span>
                      </div>

                      {speakerDetails.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="mr-2 h-4 w-4" />
                          <span>{speakerDetails.phone}</span>
                        </div>
                      )}

                      {speakerDetails.address && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="mr-2 h-4 w-4" />
                          <span>{speakerDetails.address}</span>
                        </div>
                      )}

                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>
                          Tham gia:{' '}
                          {format(
                            new Date(speakerDetails.createdAt),
                            'dd/MM/yyyy',
                            { locale: vi }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Tổng thu nhập
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(speakerDetails.totalEarnings || 0)}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Đã thanh toán
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(speakerDetails.totalPaid || 0)}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Chưa thanh toán
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(speakerDetails.totalUnpaid || 0)}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Số sự kiện
                      </p>
                      <p className="text-2xl font-bold text-orange-600">
                        {speakerDetails.eventCount || 0}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Information Tabs */}
            <Tabs defaultValue="events" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="events">Sự kiện & Thanh toán</TabsTrigger>
                <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
              </TabsList>

              <TabsContent value="events" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Danh sách sự kiện và thanh toán</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {speakerDetails.events &&
                    speakerDetails.events.length > 0 ? (
                      <div className="space-y-4">
                        {speakerDetails.events.map((event: any) => (
                          <div
                            key={event.id}
                            className="rounded-lg border p-4 transition-shadow hover:shadow-md"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                  <h4 className="text-lg font-semibold">
                                    {event.title}
                                  </h4>
                                  <Badge
                                    variant={
                                      event.isPaidForSpeaker
                                        ? 'default'
                                        : 'secondary'
                                    }
                                    className={
                                      event.isPaidForSpeaker
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }
                                  >
                                    {event.isPaidForSpeaker
                                      ? 'Đã thanh toán'
                                      : 'Chưa thanh toán'}
                                  </Badge>
                                </div>
                                <p className="mb-3 text-sm text-gray-600">
                                  {event.description}
                                </p>

                                <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                                  <div>
                                    <span className="text-gray-500">
                                      Ngày bắt đầu:
                                    </span>
                                    <p className="font-medium">
                                      {format(
                                        new Date(event.startDate),
                                        'dd/MM/yyyy HH:mm',
                                        { locale: vi }
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">
                                      Ngày kết thúc:
                                    </span>
                                    <p className="font-medium">
                                      {format(
                                        new Date(event.endDate),
                                        'dd/MM/yyyy HH:mm',
                                        { locale: vi }
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">
                                      Doanh thu sự kiện:
                                    </span>
                                    <p className="font-medium text-blue-600">
                                      {formatCurrency(event.totalRevenue || 0)}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">
                                      Số vé bán:
                                    </span>
                                    <p className="font-medium">
                                      {event.ticketCount || 0} vé
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="ml-4 text-right">
                                <div className="rounded-lg bg-gray-50 p-3">
                                  <p className="mb-1 text-xs text-gray-500">
                                    Hoa hồng {event.commissionRate}%
                                  </p>
                                  <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(event.speakerEarning || 0)}
                                  </p>
                                  <p className="mt-1 text-xs text-gray-500">
                                    Từ {formatCurrency(event.amount || 0)}
                                  </p>
                                </div>

                                {event.isPaidForSpeaker &&
                                  event.paymentProofImageUrl && (
                                    <div className="mt-2">
                                      <a
                                        href={event.paymentProofImageUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline"
                                      >
                                        Xem chứng từ thanh toán
                                      </a>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                          Chưa có sự kiện nào
                        </h3>
                        <p className="mt-2 text-gray-600">
                          Speaker chưa tham gia sự kiện nào
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin hồ sơ</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        ID
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {speakerDetails.id}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Vai trò
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {speakerDetails.role}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Ngày tạo
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {format(
                          new Date(speakerDetails.createdAt),
                          'dd/MM/yyyy HH:mm',
                          { locale: vi }
                        )}
                      </p>
                    </div>

                    {speakerDetails.updatedAt && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Cập nhật lần cuối
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {format(
                            new Date(speakerDetails.updatedAt),
                            'dd/MM/yyyy HH:mm',
                            { locale: vi }
                          )}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="py-12 text-center">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Không tìm thấy thông tin speaker
            </h3>
            <p className="mt-2 text-gray-600">Vui lòng thử lại sau</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
