import { useParams, useSearchParams } from 'react-router-dom';
import ListData from '../../list-data';
import { DataTableSkeleton } from '@/components/shared/data-table-skeleton';
import { useGetEventTicketByEventId } from '@/queries/event.query';
import { PaymentStatus } from '@/types/api.types';

export function OverViewTab() {
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get('page') || 1);
  const pageLimit = Number(searchParams.get('limit') || 10);
  const keyword = searchParams.get('keyword') || '';
  const { id } = useParams();
  const { data, isPending } = useGetEventTicketByEventId(
    page,
    pageLimit,
    keyword,
    id
  );

  const listObjects = data?.listObjects || [];
  const totalRecords = data?.totalRecords || 0;
  const pageCount = Math.ceil(totalRecords / pageLimit);

  const ticketSuccess = listObjects.filter(
    (ticket: any) => ticket.isActive == true
  );
  console.log(ticketSuccess);

  return (
    <>
      <div className="grid gap-6 rounded-md p-4 pt-0 ">
        <h1 className="text-center font-bold">DANH SÁCH KHÁCH THAM DỰ</h1>
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
            data={ticketSuccess}
            page={totalRecords}
            totalUsers={totalRecords}
            pageCount={pageCount}
          />
        )}
      </div>
    </>
  );
}
