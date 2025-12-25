import { ColumnDef } from '@tanstack/react-table';
import { useSearchParams } from 'react-router-dom';
import { CellAction } from './cell-action';
import { EntryTestModel } from '@/types/api.types';
import { Badge } from '@/components/ui/badge';

export const columns: ColumnDef<EntryTestModel>[] = [
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
    header: 'Tiêu đề',
    enableSorting: true
  },
  {
    accessorKey: 'description',
    header: 'Mô tả',
    enableSorting: true,
    cell: ({ row }) => {
      const description = row.original.description;
      return (
        <span className="line-clamp-2">
          {description || 'Chưa có mô tả'}
        </span>
      );
    }
  },
  {
    accessorKey: 'isActive',
    header: 'Trạng thái',
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Đang hoạt động' : 'Không hoạt động'}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'displayOrder',
    header: 'Thứ tự',
    enableSorting: true
  },
  {
    id: 'actions',
    header: 'Hành động',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
