import { ColumnDef } from '@tanstack/react-table';
import { useSearchParams } from 'react-router-dom';
import { CellAction } from './cell-action';
import { Major } from '@/types/api.types';

export const columns: ColumnDef<Major>[] = [
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
    header: 'Tên chuyên ngành',
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
    id: 'actions',
    header: 'Hành động',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
