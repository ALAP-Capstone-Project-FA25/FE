import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import __helpers from '@/helpers';

// ---- Types cho rõ ràng ----
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

export type UserRow = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  username: string;
  email: string;
  gender: number | null; // 0,1,2... tuỳ hệ thống
  emailConfirmed: boolean;
  avatar: string | null;
  isActive: boolean;
  phone: string | null;
  address: string | null;
  role: number; // 1 = Admin ? (tùy hệ thống của bạn)
  googleId: string | null;
  userOrigin: number | null;
  loginHistories: LoginHistory[];
  userCourses: UserCourse[];
  createdAt: string;
  updatedAt: string;
};

const genderText = (g: number | null | undefined) => {
  if (g === 0) return 'Nam';
  if (g === 1) return 'Nữ';
  return 'Khác';
};

const roleText = (r: number) => {
  // chỉnh map này theo backend của bạn
  const map: Record<number, string> = {
    1: 'Admin',
    2: 'Giáo viên',
    3: 'Học viên'
  };
  return map[r] || `Role ${r}`;
};

const formatDateTime = (iso?: any) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(+d)) return '—';
  return d.toLocaleString(); // hoặc dùng dayjs
};

const getLatestLogin = (rows: LoginHistory[]) => {
  if (!rows?.length) return null;
  const latest = [...rows].sort(
    (a, b) => new Date(b.loginDate).getTime() - new Date(a.loginDate).getTime()
  )[0];
  return latest?.loginDate ?? null;
};

export const columns: ColumnDef<UserRow>[] = [
  {
    id: 'stt',
    header: 'STT',
    enableSorting: false,
    cell: ({ row, table }) => {
      // lấy page/limit từ meta (đã truyền khi khởi tạo table)
      const page = (table.options.meta as any)?.page ?? 1;
      const limit = (table.options.meta as any)?.limit ?? 10;
      const serialNumber = (page - 1) * limit + row.index + 1;
      return <span>{serialNumber}</span>;
    },
    size: 60
  },
  {
    id: 'avatar',
    header: 'Ảnh đại diện',
    enableSorting: false,
    cell: ({ row }) => {
      const url = row.original.avatar || '';
      return (
        <img
          src={
            url || 'https://avatars.githubusercontent.com/u/0?v=4' // fallback
          }
          alt={row.original.username || 'avatar'}
          className="h-10 w-10 rounded object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'https://avatars.githubusercontent.com/u/0?v=4';
          }}
        />
      );
    }
  },
  {
    accessorKey: 'username',
    header: 'Tài khoản',
    enableSorting: true,
    cell: ({ row }) => {
      const u = row.original;
      const fullName =
        [u.firstName, u.lastName].filter(Boolean).join(' ') || '—';
      return (
        <div className="flex flex-col">
          <span className="font-medium">{fullName}</span>
          <span className="text-xs text-muted-foreground">@{u.username}</span>
        </div>
      );
    }
  },
  {
    accessorKey: 'email',
    header: 'Email',
    enableSorting: true,
    cell: ({ row }) => {
      const email = row.original.email;
      const confirmed = row.original.emailConfirmed;
      return (
        <div className="flex items-center gap-2">
          <span className="truncate">{email}</span>
          <Badge variant={confirmed ? 'default' : 'secondary'}>
            {confirmed ? 'Đã xác minh' : 'Chưa xác minh'}
          </Badge>
        </div>
      );
    }
  },
  {
    id: 'phone',
    header: 'SĐT',
    enableSorting: false,
    cell: ({ row }) => row.original.phone || '—'
  },
  {
    id: 'gender',
    header: 'Giới tính',
    enableSorting: false,
    cell: ({ row }) => genderText(row.original.gender)
  },
  {
    id: 'role',
    header: 'Quyền',
    enableSorting: true,
    cell: ({ row }) => {
      const txt = roleText(row.original.role);
      const variant =
        row.original.role === 1
          ? 'destructive'
          : row.original.role === 2
            ? 'default'
            : 'secondary';
      return <Badge variant={variant as any}>{txt}</Badge>;
    }
  },
  {
    id: 'status',
    header: 'Trạng thái',
    enableSorting: true,
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? 'outline' : 'secondary'}>
        {row.original.isActive ? 'Active' : 'Inactive'}
      </Badge>
    )
  },
  {
    id: 'courses',
    header: 'Khóa học',
    enableSorting: false,
    cell: ({ row }) => {
      const list = row.original.userCourses || [];
      if (!list.length) return <span>—</span>;
      const names = list.map((c) => c.title).filter(Boolean);
      // hiển thị tối đa 2 tên + “+N”
      const head = names.slice(0, 2).join(', ');
      const remain = names.length - 2;
      return (
        <span title={names.join(', ')}>
          {head}
          {remain > 0 ? ` +${remain}` : ''}
        </span>
      );
    }
  },
  {
    id: 'lastLogin',
    header: 'Đăng nhập gần nhất',
    enableSorting: true,
    cell: ({ row }) =>
      formatDateTime(getLatestLogin(row.original.loginHistories))
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
