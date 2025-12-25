import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { CellAction } from './cell-action';

// ==== Types khớp với response ====

type PackageRow = {
  title: string;
  description: string;
  packageType: number;
  price: number;
  duration: number; // ngày
  isActive: boolean;
  features: string | string[]; // có thể là JSON string
  isPopular: boolean;
  id: number;
  createdAt: string;
  updatedAt: string;
};

type LoginHistory = {
  userId: number;
  loginDate: string;
  ipAddress: string | null;
  userAgent: string | null;
  id: number;
  createdAt: string;
  updatedAt: string;
};

type UserCourse = {
  userId: number;
  courseId: number;
  isActive: boolean;
  isDone: boolean;
  completedAt: string | null;
  paymentId: number | null;
  title: string;
  description: string;
  userTopics: any[];
  id: number;
  createdAt: string;
  updatedAt: string;
};

type UserRowLite = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  username: string;
  email: string;
  gender: number | null;
  emailConfirmed: boolean;
  avatar: string | null;
  isActive: boolean;
  phone: string | null;
  address: string | null;
  role: number;
  googleId: string | null;
  userOrigin: number | null;
  loginHistories: LoginHistory[];
  userCourses: UserCourse[];
  createdAt: string;
  updatedAt: string;
};

export type PaymentRow = {
  id: number;
  code: number | string;
  amount: number;
  qrCode: string | null;
  paymentUrl: string | null;
  paymentType: number; // 1=Online? (map ở dưới)
  paymentStatus: number; // 0..n (map ở dưới)
  packageId: number;
  package: PackageRow;
  userId: number;
  user: UserRowLite;
  item?: string; // có thể chứa JSON string
  createdAt: string;
  updatedAt: string;
};

// ==== Helpers ====

const vnd = (n?: number) =>
  typeof n === 'number'
    ? new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(n)
    : '—';

const formatDateTime = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(+d) ? '—' : d.toLocaleString();
};

const fullNameOf = (u: UserRowLite) =>
  [u?.firstName, u?.lastName].filter(Boolean).join(' ') || '—';

const paymentStatusText = (s?: number) => {
  const map: Record<
    number,
    {
      label: string;
      variant: 'default' | 'secondary' | 'outline' | 'destructive' | 'success';
    }
  > = {
    1: { label: 'Chờ thanh toán', variant: 'secondary' },
    2: { label: 'Đã thanh toán', variant: 'success' },
    4: { label: 'Hết hạn', variant: 'destructive' },
    3: { label: 'Hủy', variant: 'secondary' }
  };
  return (
    map?.[s ?? -1] ?? { label: `Trạng thái ${s}`, variant: 'outline' as const }
  );
};

// ==== Columns cho bảng Payments ====

export const columns: ColumnDef<PaymentRow>[] = [
  {
    id: 'stt',
    header: 'STT',
    enableSorting: false,
    size: 64,
    cell: ({ row, table }) => {
      const page = (table.options.meta as any)?.page ?? 1;
      const limit = (table.options.meta as any)?.limit ?? 10;
      const serialNumber = (page - 1) * limit + row.index + 1;
      return <span>{serialNumber}</span>;
    }
  },
  {
    accessorKey: 'code',
    header: 'Mã giao dịch',
    enableSorting: true,
    cell: ({ row }) => <span className="font-medium">{row.original.code}</span>
  },
  {
    id: 'user',
    header: 'Người dùng',
    enableSorting: false,
    cell: ({ row }) => {
      const u = row.original.user;
      const avatar =
        u?.avatar || 'https://avatars.githubusercontent.com/u/0?v=4';
      const name = fullNameOf(u);
      return (
        <div className="flex min-w-[220px] items-center gap-3">
          <img
            src={avatar}
            alt={u?.username || 'avatar'}
            className="h-9 w-9 rounded object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://avatars.githubusercontent.com/u/0?v=4';
            }}
          />
          <div className="flex flex-col">
            <span className="font-medium">{name}</span>
            <span className="text-xs text-muted-foreground">
              @{u?.username}
            </span>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: 'amount',
    header: 'Số tiền',
    enableSorting: true,
    cell: ({ row }) => vnd(row.original.amount)
  },

  {
    id: 'status',
    header: 'Trạng thái',
    enableSorting: true,
    cell: ({ row }) => {
      const s = paymentStatusText(row.original.paymentStatus);
      return <Badge variant={s.variant}>{s.label}</Badge>;
    }
  },
  {
    id: 'links',
    header: 'Liên kết',
    enableSorting: false,
    cell: ({ row }) => {
      const { paymentUrl, qrCode } = row.original;
      if (!paymentUrl && !qrCode) return '—';
      return (
        <div className="flex flex-col gap-1">
          {paymentUrl ? (
            <a
              href={paymentUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary underline"
            >
              Link thanh toán
            </a>
          ) : null}
        </div>
      );
    }
  },
  {
    id: 'createdAt',
    header: 'Tạo lúc',
    enableSorting: true,
    cell: ({ row }) => formatDateTime(row.original.createdAt)
  },
  {
    id: 'actions',
    header: '',
    enableSorting: false,
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
