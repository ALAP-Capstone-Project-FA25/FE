import DataTable from '@/components/shared/data-table';
import { columns } from './columns';
type TTableProps = {
  data: any;
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
          placeHolderInputSearch="Mã môn..."
          showSearch={false}
        />
      )}
    </>
  );
}
