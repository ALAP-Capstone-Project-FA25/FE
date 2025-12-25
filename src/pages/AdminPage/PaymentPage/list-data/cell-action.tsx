import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useUpdatePaymentStatus } from '@/queries/payment.query';
import { MoreHorizontal, Edit, Eye } from 'lucide-react';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useQueryClient } from '@tanstack/react-query';
import { PaymentRow } from './columns';

interface CellActionProps {
  data: PaymentRow;
}

const PAYMENT_STATUS = {
  1: { label: 'Chờ thanh toán', color: 'text-yellow-600' }, // PENDING
  2: { label: 'Thành công', color: 'text-green-600' },      // SUCCESS
  3: { label: 'Đã hủy', color: 'text-red-600' },            // CANCELLED
  4: { label: 'Hết hạn', color: 'text-gray-600' }           // EXPIRED
};

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(
    data.paymentStatus.toString()
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutateAsync: updateStatus, isPending } = useUpdatePaymentStatus();

  const handleUpdateStatus = async () => {
    try {
      const [err] = await updateStatus({
        id: data.id,
        status: Number(selectedStatus)
      });

      if (err) {
        toast({
          title: 'Lỗi',
          description: err.message || 'Không thể cập nhật trạng thái',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Thành công!',
          description: 'Trạng thái thanh toán đã được cập nhật',
          variant: 'default'
        });
        queryClient.invalidateQueries({ queryKey: ['payments'] });
        queryClient.invalidateQueries({ queryKey: ['payment-statistics'] });
        setShowStatusDialog(false);
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Có lỗi xảy ra',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Mở menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setShowDetailDialog(true)}>
            <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowStatusDialog(true)}>
            <Edit className="mr-2 h-4 w-4" /> Cập nhật trạng thái
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết hóa đơn #{data.code}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-500">Người dùng</Label>
                <p className="font-medium">
                  {data.user?.firstName} {data.user?.lastName}
                </p>
                <p className="text-sm text-gray-500">@{data.user?.username}</p>
              </div>
              <div>
                <Label className="text-gray-500">Email</Label>
                <p className="font-medium">{data.user?.email}</p>
              </div>
              <div>
                <Label className="text-gray-500">Số tiền</Label>
                <p className="text-lg font-bold text-green-600">
                  {data.amount.toLocaleString()}đ
                </p>
              </div>
              <div>
                <Label className="text-gray-500">Trạng thái</Label>
                <p className={`font-medium ${PAYMENT_STATUS[data.paymentStatus as keyof typeof PAYMENT_STATUS]?.color}`}>
                  {PAYMENT_STATUS[data.paymentStatus as keyof typeof PAYMENT_STATUS]?.label}
                </p>
              </div>
              {data.package && (
                <>
                  <div>
                    <Label className="text-gray-500">Gói</Label>
                    <p className="font-medium">{data.package.title}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Thời hạn</Label>
                    <p className="font-medium">{data.package.duration} ngày</p>
                  </div>
                </>
              )}
              <div>
                <Label className="text-gray-500">Ngày tạo</Label>
                <p className="font-medium">
                  {new Date(data.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <div>
                <Label className="text-gray-500">Cập nhật</Label>
                <p className="font-medium">
                  {new Date(data.updatedAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
            {data.paymentUrl && (
              <div>
                <Label className="text-gray-500">Link thanh toán</Label>
                <a
                  href={data.paymentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-sm text-blue-600 underline"
                >
                  {data.paymentUrl}
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái thanh toán</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Mã giao dịch: #{data.code}</Label>
              <p className="text-sm text-gray-500">
                Số tiền: {data.amount.toLocaleString()}đ
              </p>
              {data.package && (
                <p className="text-sm text-gray-500">
                  Loại: Gói {data.package.title}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái mới</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAYMENT_STATUS).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedStatus === '2' && data.paymentStatus !== 2 && (
              <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Lưu ý:</strong> Khi cập nhật thành "Thành công", hệ thống sẽ tự động:
                </p>
                <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside space-y-1">
                  {data.package && <li>Kích hoạt gói {data.package.title} cho người dùng</li>}
                  <li>Cập nhật các thông tin liên quan (vé sự kiện, khóa học...)</li>
                </ul>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowStatusDialog(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isPending}>
              {isPending ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
