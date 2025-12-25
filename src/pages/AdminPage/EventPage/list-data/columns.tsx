import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import __helpers from '@/helpers';
import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export enum EventStatus {
  IN_COMING = 1,
  IN_PROGRESS = 2,
  COMPLETED = 3,
  CANCELLED = 4
}

const EVENT_STATUS_LABEL: Record<number, string> = {
  [EventStatus.IN_COMING]: 'Sắp diễn ra',
  [EventStatus.IN_PROGRESS]: 'Đang diễn ra',
  [EventStatus.COMPLETED]: 'Đã hoàn thành',
  [EventStatus.CANCELLED]: 'Đã hủy'
};

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'STT',
    header: 'STT',
    enableSorting: true,
    cell: ({ row }) => {
      // Lưu ý: hook này chỉ OK nếu columns được dùng bên trong 1 component React
      const [searchParams] = useSearchParams();
      const pageLimit = Number(searchParams.get('limit') || 10);
      const page = Number(searchParams.get('page') || 1);
      const rowIndex = row.index;
      const serialNumber = (page - 1) * pageLimit + rowIndex + 1;
      return <span>{serialNumber}</span>;
    }
  },
  {
    accessorKey: 'title',
    header: 'Tiêu đề sự kiện',
    enableSorting: true
  },
  {
    accessorKey: 'imageUrls',
    header: 'Ảnh sự kiện',
    enableSorting: false,
    cell: ({ row }) => {
      const imageUrl = row.original.imageUrls;
      if (!imageUrl) return <span>—</span>;

      return (
        <img
          src={imageUrl}
          alt="Ảnh sự kiện"
          className="h-10 w-10 rounded object-cover"
        />
      );
    }
  },

  {
    accessorKey: 'startDate',
    header: 'Ngày bắt đầu',
    enableSorting: true,
    cell: ({ row }) => {
      const startDate = row.original.startDate;
      if (!startDate) return <span>—</span>;

      return <span>{new Date(startDate).toLocaleString('vi-VN')}</span>;
    }
  },
  {
    accessorKey: 'endDate',
    header: 'Ngày kết thúc',
    enableSorting: true,
    cell: ({ row }) => {
      const endDate = row.original.endDate;
      if (!endDate) return <span>—</span>;

      return <span>{new Date(endDate).toLocaleString('vi-VN')}</span>;
    }
  },
  {
    accessorKey: 'amount',
    header: 'Giá vé (vnđ)',
    enableSorting: false,
    cell: ({ row }) => {
      const amount = row.original.amount;
      if (amount == null) return <span>—</span>;

      return <span>{__helpers.formatCurrency(amount)} đ</span>;
    }
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    enableSorting: false,
    cell: ({ row }) => {
      const status = row.original.status as number;
      const label = EVENT_STATUS_LABEL[status] ?? 'Không xác định';
      const colorClass = status === EventStatus.CANCELLED 
        ? 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium'
        : status === EventStatus.COMPLETED
        ? 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium'
        : status === EventStatus.IN_PROGRESS
        ? 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium'
        : 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium';
      return <span className={colorClass}>{label}</span>;
    }
  },
  {
    accessorKey: 'speaker',
    header: 'Diễn giả',
    enableSorting: false,
    cell: ({ row }) => {
      const speaker = row.original.speaker;
      if (!speaker) return <span>—</span>;

      return (
        <span>
          {speaker.firstName} {speaker.lastName}
        </span>
      );
    }
  },
  {
    accessorKey: 'commissionRate',
    header: 'Hoa hồng (%)',
    enableSorting: false,
    cell: ({ row }) => {
      const commissionRate = row.original.commissionRate;
      if (commissionRate == null) return <span>—</span>;
      return <span>{commissionRate}%</span>;
    }
  },
  {
    accessorKey: 'isPaidForSpeaker',
    header: 'Đã chuyển tiền',
    enableSorting: false,
    cell: ({ row }) => {
      const isPaid = row.original.isPaidForSpeaker;
      const paymentProofImageUrl = row.original.paymentProofImageUrl;
      const [showImageDialog, setShowImageDialog] = useState(false);
      
      if (!isPaid) {
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Chưa chuyển
          </span>
        );
      }
      
      return (
        <>
          <span 
            className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 cursor-pointer hover:bg-green-200 transition-colors"
            onClick={() => setShowImageDialog(true)}
          >
            Đã chuyển
          </span>
          
          <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Hình ảnh chuyển tiền</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                {paymentProofImageUrl ? (
                  <img
                    src={paymentProofImageUrl}
                    alt="Payment proof"
                    className="w-full h-auto rounded-lg border"
                  />
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    Không có hình ảnh chuyển tiền
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
