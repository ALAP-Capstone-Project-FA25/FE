import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import __helpers from '@/helpers';
import { useSearchParams } from 'react-router-dom';

export enum EventStatus {
  IN_COMING = 1,
  IN_PROGRESS = 2,
  COMPLETED = 3
}

const EVENT_STATUS_LABEL: Record<number, string> = {
  [EventStatus.IN_COMING]: 'Sắp diễn ra',
  [EventStatus.IN_PROGRESS]: 'Đang diễn ra',
  [EventStatus.COMPLETED]: 'Đã hoàn thành'
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
      return <span>{label}</span>;
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
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
