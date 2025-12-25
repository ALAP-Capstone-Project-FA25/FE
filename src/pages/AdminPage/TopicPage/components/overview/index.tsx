import { useSearchParams } from 'react-router-dom';
import { DataTableSkeleton } from '@/components/shared/data-table-skeleton';
import { useGetTopicsByCourseId } from '@/queries/topic.query';
import { useParams } from 'react-router-dom';
import ListData from '../../list-data';

export function OverViewTab() {
  const { courseId } = useParams<{ courseId: string }>();
  const [searchParams] = useSearchParams();
  const pageLimit = Number(searchParams.get('limit') || 10);

  const { data, isPending } = useGetTopicsByCourseId(parseInt(courseId || '0'));

  // Access data from TFUResponse format
  const responseData = data;
  const listObjects = responseData?.listObjects || [];
  const totalRecords = responseData?.totalRecords || 0;
  const pageCount = Math.ceil(totalRecords / pageLimit);

  return (
    <>
      <div className="grid gap-6 rounded-md p-4 pt-0 ">
        <h1 className="text-center font-bold">DANH SÁCH CHỦ ĐỀ</h1>
        {isPending ? (
          <div className="p-5">
            <DataTableSkeleton
              columnCount={10}
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
