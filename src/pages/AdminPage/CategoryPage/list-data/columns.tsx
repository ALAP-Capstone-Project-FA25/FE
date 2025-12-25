import { ColumnDef } from '@tanstack/react-table';
import { useSearchParams } from 'react-router-dom';
import { CellAction } from './cell-action';
import { Category } from '@/types/api.types';
import { Badge } from '@/components/ui/badge';

export const columns: ColumnDef<Category>[] = [
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
    accessorKey: 'name',
    header: 'Tên môn học',
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
    accessorKey: 'imageUrl',
    header: 'Ảnh minh họa',
    enableSorting: false,
    cell: ({ row }) => {
      const imageUrl = row.original.imageUrl;
      return imageUrl ? (
        <img
          src={imageUrl}
          alt="Ảnh minh họa"
          className="h-10 w-10 rounded object-cover"
        />
      ) : (
        <span className="text-sm text-gray-400">Chưa có ảnh</span>
      );
    }
  },
  {
    accessorKey: 'courses',
    header: 'Số khóa học',
    enableSorting: false,
    cell: ({ row }) => {
      const courses = row.original.courses || [];
      return (
        <Badge variant="secondary" className="font-semibold">
          {courses.length} khóa học
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
