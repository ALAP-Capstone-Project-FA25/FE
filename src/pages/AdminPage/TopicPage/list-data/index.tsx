import DataTable from '@/components/shared/data-table';
import { columns } from './columns';

interface ListDataProps {
  data: any[];
  page: number;
  totalUsers: number;
  pageCount: number;
}

export default function ListData({
  data,
  page,
  totalUsers,
  pageCount
}: ListDataProps) {
  return <DataTable columns={columns} data={data} pageCount={pageCount} />;
}
