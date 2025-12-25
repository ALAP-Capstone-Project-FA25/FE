import DataTable from '@/components/shared/data-table';
import { columns } from './columns';
import { Package } from '@/types/api.types';

type TTableProps = {
  data: Package[];
  page: number;
  totalRecords: number;
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
          placeHolderInputSearch="Tìm kiếm gói..."
          showSearch={true}
        />
      )}
    </>
  );
}

