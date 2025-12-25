import { ColumnDef } from '@tanstack/react-table';
import { useSearchParams } from 'react-router-dom';
import { CellAction } from './cell-action';
import { Package } from '@/types/api.types';
import { Badge } from '@/components/ui/badge';

export const columns: ColumnDef<Package>[] = [
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
    accessorKey: 'title',
    header: 'Tên gói',
    enableSorting: true
  },
  {
    accessorKey: 'description',
    header: 'Mô tả',
    enableSorting: true,
    cell: ({ row }) => {
      const description = row.original.description;
      return (
        <span className="line-clamp-2 max-w-xs">
          {description || 'Chưa có mô tả'}
        </span>
      );
    }
  },
  {
    accessorKey: 'packageType',
    header: 'Loại gói',
    enableSorting: true,
    cell: ({ row }) => {
      const packageType = row.original.packageType;
      const typeLabels = {
        0: 'STARTER',
        1: 'PREMIUM'
      };
      const typeColors = {
        0: 'bg-blue-100 text-blue-800',
        1: 'bg-purple-100 text-purple-800'
      };
      return (
        <Badge
          variant="secondary"
          className={typeColors[packageType as keyof typeof typeColors]}
        >
          {typeLabels[packageType as keyof typeof typeLabels]}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'price',
    header: 'Giá',
    enableSorting: true,
    cell: ({ row }) => {
      const price = row.original.price;
      return (
        <span className="font-semibold">
          {price.toLocaleString('vi-VN')}đ
        </span>
      );
    }
  },
  {
    accessorKey: 'duration',
    header: 'Thời hạn (ngày)',
    enableSorting: true,
    cell: ({ row }) => {
      const duration = row.original.duration;
      return <span>{duration} ngày</span>;
    }
  },
  {
    accessorKey: 'isActive',
    header: 'Trạng thái',
    enableSorting: true,
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Hoạt động' : 'Tạm dừng'}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'isPopular',
    header: 'Phổ biến',
    enableSorting: true,
    cell: ({ row }) => {
      const isPopular = row.original.isPopular;
      return (
        <Badge variant={isPopular ? 'default' : 'outline'}>
          {isPopular ? 'Có' : 'Không'}
        </Badge>
      );
    }
  },
  {
    id: 'actions',
    header: 'Hành động',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];

