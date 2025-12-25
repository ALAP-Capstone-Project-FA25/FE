import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import __helpers from '@/helpers';
import { useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export enum PaymentStatus {
  PENDING = 1,
  PAID = 2,
  FAILED = 3,
  CANCELLED = 4
}

const PAYMENT_STATUS_LABEL: Record<number, string> = {
  [PaymentStatus.PENDING]: 'Chờ thanh toán',
  [PaymentStatus.PAID]: 'Đã thanh toán',
  [PaymentStatus.FAILED]: 'Thất bại',
  [PaymentStatus.CANCELLED]: 'Đã hủy'
};

const PAYMENT_STATUS_COLOR: Record<
  number,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  [PaymentStatus.PENDING]: 'outline',
  [PaymentStatus.PAID]: 'default',
  [PaymentStatus.FAILED]: 'destructive',
  [PaymentStatus.CANCELLED]: 'secondary'
};

export const columns: ColumnDef<any>[] = [
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
    header: 'Người đăng ký',
    enableSorting: false,
    cell: ({ row }) => {
      const user = row.original.user;
      if (!user) return <span>—</span>;

      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {user.firstName} {user.lastName}
          </span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
      );
    }
  },
  {
    accessorKey: 'payment.code',
    header: 'Mã đơn hàng',
    enableSorting: false,
    cell: ({ row }) => {
      const payment = row.original.payment;
      if (!payment) return <span>—</span>;
      return <span className="font-mono text-sm">{payment.code}</span>;
    }
  },
  {
    accessorKey: 'amount',
    header: 'Số tiền',
    enableSorting: true,
    cell: ({ row }) => {
      const amount = row.original.amount;
      if (amount == null) return <span>—</span>;
      return (
        <span className="font-medium">
          {__helpers.formatCurrency(amount)} đ
        </span>
      );
    }
  },
  {
    accessorKey: 'payment.paymentStatus',
    header: 'Trạng thái thanh toán',
    enableSorting: false,
    cell: ({ row }) => {
      const payment = row.original.payment;
      if (!payment) return <span>—</span>;

      const status = payment.paymentStatus as number;
      const label = PAYMENT_STATUS_LABEL[status] ?? 'Không xác định';
      const variant = PAYMENT_STATUS_COLOR[status] ?? 'default';

      return <Badge variant={variant}>{label}</Badge>;
    }
  },

  {
    accessorKey: 'createdAt',
    header: 'Ngày đăng ký',
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
