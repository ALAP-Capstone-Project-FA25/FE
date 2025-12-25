import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import __helpers from '@/helpers';
import { useSearchParams } from 'react-router-dom';
import { EventTicket } from '@/types/refund';
import { Badge } from '@/components/ui/badge';

export const columns: ColumnDef<EventTicket>[] = [
  {
    accessorKey: 'STT',
    header: 'STT',
    enableSorting: true,
    cell: ({ row }) => {
      const [searchParams] = useSearchParams();
      const pageLimit = Number(searchParams.get('limit') || 10);
      const page = Number(searchParams.get('page') || 1);
      const rowIndex = row.index;
      const serialNumber = (page - 1) * pageLimit + rowIndex + 1;
      return <span>{serialNumber}</span>;
    }
  },
  {
    accessorKey: 'user',
    header: 'Người dùng',
    enableSorting: false,
    cell: ({ row }) => {
      const user = row.original.user;
      if (!user) return <span>—</span>;

      return (
        <div className="flex items-center gap-2">
          {user.avatar && (
            <img
              src={user.avatar}
              alt={user.firstName}
              className="h-8 w-8 rounded-full object-cover"
            />
          )}
          <div>
            <div className="font-medium">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: 'event',
    header: 'Sự kiện',
    enableSorting: false,
    cell: ({ row }) => {
      const event = row.original.event;
      if (!event) return <span>—</span>;

      return (
        <div className="flex items-center gap-2">
          {event.imageUrls && (
            <img
              src={event.imageUrls}
              alt={event.title}
              className="h-10 w-10 rounded object-cover"
            />
          )}
          <span className="font-medium">{event.title}</span>
        </div>
      );
    }
  },
  {
    accessorKey: 'amount',
    header: 'Số tiền',
    enableSorting: false,
    cell: ({ row }) => {
      const amount = row.original.amount;
      return <span className="font-semibold">{__helpers.formatCurrency(amount)} đ</span>;
    }
  },
  {
    accessorKey: 'isRefunded',
    header: 'Trạng thái',
    enableSorting: false,
    cell: ({ row }) => {
      const isRefunded = row.original.isRefunded;
      return isRefunded ? (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Đã hoàn tiền
        </Badge>
      ) : (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          Chưa hoàn tiền
        </Badge>
      );
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Ngày tạo',
    enableSorting: true,
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;
      if (!createdAt) return <span>—</span>;
      return <span>{new Date(createdAt).toLocaleString('vi-VN')}</span>;
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
