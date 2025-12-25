import DataTable from '@/components/shared/data-table';
import { columns } from './columns';
import { EntryTestModel } from '@/types/api.types';

type TTableProps = {
  data: EntryTestModel[];
  page: number;
  totalUsers: number;
  pageCount: number;
  bulkActions?: any[];
};

export default function ListData({ data, pageCount }: TTableProps) {
  return (
    <>
      {data && (
        <DataTable
          columns={columns}
          data={data}
          pageCount={pageCount}
          showAdd={false}
          heightTable="50dvh"
          placeHolderInputSearch="Tìm kiếm bài test..."
          showSearch={true}
        />
      )}
    </>
  );
}
