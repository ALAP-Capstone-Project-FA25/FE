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

const paymentTypeText = (t?: number) => {
  const map: Record<number, string> = {
    1: 'Online',
    2: 'Chuyển khoản',
    3: 'Tiền mặt'
  };
  return map?.[t ?? -1] ?? `Loại ${t}`;
};

const paymentStatusText = (s?: number) => {
  const map: Record<
    number,
    {
      label: string;
      variant: 'default' | 'secondary' | 'outline' | 'destructive';
    }
  > = {
    0: { label: 'Chờ thanh toán', variant: 'secondary' },
    1: { label: 'Đã thanh toán', variant: 'default' },
    2: { label: 'Thất bại', variant: 'destructive' },
    3: { label: 'Hoàn tiền', variant: 'outline' },
    4: { label: 'Hủy', variant: 'secondary' }
  };
  return (
    map?.[s ?? -1] ?? { label: `Trạng thái ${s}`, variant: 'outline' as const }
  );
};

const safeParseJSON = <T,>(s?: string | null): T | null => {
  if (!s || typeof s !== 'string') return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
};

const featureList = (pkg: PackageRow) => {
  if (!pkg?.features) return [];
  if (Array.isArray(pkg.features)) return pkg.features;
  const parsed = safeParseJSON<string[]>(pkg.features);
  return parsed ?? [];
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
    id: 'email',
    header: 'Email',
    enableSorting: true,
    cell: ({ row }) => {
      const u = row.original.user;
      return (
        <div className="flex min-w-[220px] items-center gap-2">
          <span className="truncate">{u?.email}</span>
          <Badge variant={u?.emailConfirmed ? 'default' : 'secondary'}>
            {u?.emailConfirmed ? 'Đã xác minh' : 'Chưa xác minh'}
          </Badge>
        </div>
      );
    }
  },
  {
    id: 'phone',
    header: 'SĐT',
    enableSorting: false,
    cell: ({ row }) => row.original.user?.phone || '—'
  },
  {
    id: 'package',
    header: 'Gói',
    enableSorting: true,
    cell: ({ row }) => {
      const p = row.original.package;
      const feats = featureList(p);
      const head = feats.slice(0, 2).join(', ');
      const remain = Math.max(0, feats.length - 2);
      return (
        <div className="flex min-w-[260px] flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium">{p?.title || '—'}</span>
            {p?.isPopular ? <Badge variant="default">Phổ biến</Badge> : null}
            {!p?.isActive ? <Badge variant="secondary">Ngưng</Badge> : null}
          </div>
          <div className="text-xs text-muted-foreground">
            Thời hạn: {p?.duration ? `${p.duration} ngày` : '—'}
          </div>
          {feats.length > 0 && (
            <div className="text-xs" title={feats.join(', ')}>
              {head}
              {remain > 0 ? ` +${remain}` : ''}
            </div>
          )}
        </div>
      );
    }
  },
  {
    id: 'price',
    header: 'Giá gói',
    enableSorting: true,
    cell: ({ row }) => vnd(row.original.package?.price)
  },
  {
    accessorKey: 'amount',
    header: 'Thanh toán',
    enableSorting: true,
    cell: ({ row }) => vnd(row.original.amount)
  },
  {
    id: 'method',
    header: 'Phương thức',
    enableSorting: true,
    cell: ({ row }) => paymentTypeText(row.original.paymentType)
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
              Mở trang thanh toán
            </a>
          ) : null}
          {qrCode ? (
            <a
              href={qrCode}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary underline"
            >
              QR Code
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
