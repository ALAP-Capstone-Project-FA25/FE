import { useSearchParams } from 'react-router-dom';
import { DataTableSkeleton } from '@/components/shared/data-table-skeleton';
import { useGetListEntryTestByPaging } from '@/queries/entryTest.query';
import ListData from '../../list-data';

export function OverViewTab() {
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get('page') || 1);
  const pageLimit = Number(searchParams.get('limit') || 10);
  const keyword = searchParams.get('keyword') || '';
  const { data, isPending } = useGetListEntryTestByPaging(
    page,
    pageLimit,
    keyword
  );

  const listObjects = data?.listObjects || [];
  const totalRecords = data?.totalRecords || 0;
  const pageCount = Math.ceil(totalRecords / pageLimit);

  return (
    <>
      <div className="grid gap-6 rounded-md p-4 pt-0 ">
        <h1 className="text-center font-bold">DANH SÁCH BÀI TEST ĐẦU VÀO</h1>
        {isPending ? (
          <div className="p-5">
            <DataTableSkeleton
              columnCount={5}
              filterableColumnCount={2}
              searchableColumnCount={1}
            />
          </div>
        ) : (
          <ListData
            data={listObjects}
            page={totalRecords}
            totalUsers={totalRecords}
            pageCount={pageCount}
          />
        )}
      </div>
    </>
  );
}
