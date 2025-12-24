import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { useSearchParams } from 'react-router-dom';

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
    accessorKey: 'title',
    header: 'Tiêu đề chủ đề',
    enableSorting: true
  },
  {
    accessorKey: 'description',
    header: 'Mô tả',
    enableSorting: false,
    cell: ({ row }) => {
      const description = row.original.description;
      return <span className="max-w-xs truncate">{description}</span>;
    }
  },
  {
    accessorKey: 'orderIndex',
    header: 'Thứ tự',
    enableSorting: true
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
