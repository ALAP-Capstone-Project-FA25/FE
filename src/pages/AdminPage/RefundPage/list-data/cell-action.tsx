import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { EventTicket } from '@/types/refund';
import { Edit, CheckCircle } from 'lucide-react';
import SingleFileUpload from '@/components/shared/single-file-upload';
import { useUpdateRefund } from '@/queries/eventTicket.query';
import { toast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface CellActionProps {
  data: EventTicket;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [open, setOpen] = useState(false);
  const [refundImageUrl, setRefundImageUrl] = useState<string>(
    data.refundImageUrl || ''
  );
  const [isRefunded, setIsRefunded] = useState(data.isRefunded);

  const { mutateAsync: updateRefund, isPending } = useUpdateRefund();

  const handleSubmit = async () => {
    try {
      const [err] = await updateRefund({
        ticketId: data.id,
        refundImageUrl,
        isRefunded
      });

      if (err) {
        toast({
          title: 'Lỗi',
          description: err.message || 'Có lỗi xảy ra',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Thành công!',
          description: 'Đã cập nhật trạng thái hoàn tiền',
          variant: 'success'
        });
        setOpen(false);
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating refund:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
        >
          {data.isRefunded ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <Edit className="h-4 w-4" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl overflow-scroll max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái hoàn tiền</DialogTitle>
          <DialogDescription>
            Cập nhật ảnh chứng từ và đánh dấu đã hoàn tiền cho vé này
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Ticket Info */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Người dùng:</span>{' '}
                {data.user.firstName} {data.user.lastName}
              </div>
              <div>
                <span className="font-medium">Email:</span> {data.user.email}
              </div>
              <div>
                <span className="font-medium">Sự kiện:</span> {data.event.title}
              </div>
              <div>
                <span className="font-medium">Số tiền:</span>{' '}
                <span className="font-bold text-red-600">
                  {data.amount.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>
          </div>

          {/* Upload Image */}
          <div>
            <Label className="mb-3 block text-sm font-medium">
              Ảnh chứng từ hoàn tiền
            </Label>
            <SingleFileUpload
              onFileUploaded={(url) => setRefundImageUrl(url)}
              acceptedFileTypes={['image/*']}
              maxFileSize={5}
              placeholder="Kéo thả ảnh chứng từ hoặc click để chọn"
              autoUpload={true}
            />
            {refundImageUrl && (
              <div className="mt-4 overflow-hidden rounded-lg border">
                <img
                  src={refundImageUrl}
                  alt="Chứng từ hoàn tiền"
                  className="h-48 w-full object-contain"
                />
              </div>
            )}
          </div>

          {/* Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRefunded"
              checked={isRefunded}
              onCheckedChange={(checked) => setIsRefunded(checked as boolean)}
            />
            <Label
              htmlFor="isRefunded"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Đánh dấu đã hoàn tiền (sẽ gửi email thông báo cho người dùng)
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending || !refundImageUrl}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
