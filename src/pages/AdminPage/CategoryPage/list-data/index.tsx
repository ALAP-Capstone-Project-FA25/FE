import DataTable from '@/components/shared/data-table';
import { columns } from './columns';
import { Category } from '@/types/api.types';

type TTableProps = {
  data: Category[];
  page: number;
  totalUsers: number;
  pageCount: number;
  bulkActions?: any[];
};

export default function ListData({
  data,
  pageCount,
  bulkActions
}: TTableProps) {
  return (
    <>
      {data && (
        <DataTable
          columns={columns}
          data={data}
          pageCount={pageCount}
          showAdd={false}
          heightTable="50dvh"
          placeHolderInputSearch="Tìm kiếm môn học..."
          showSearch={true}
        />
      )}
    </>
  );
}
