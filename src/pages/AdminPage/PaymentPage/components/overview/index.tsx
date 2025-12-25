import { useSearchParams } from 'react-router-dom';
import ListData from '../../list-data';
import { DataTableSkeleton } from '@/components/shared/data-table-skeleton';
import { useGetPaymentByPaging } from '@/queries/payment.query';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Search } from 'lucide-react';

export function OverViewTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') || 1);
  const pageLimit = Number(searchParams.get('limit') || 10);

  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<number | undefined>(undefined);

  const { data, isPending } = useGetPaymentByPaging(
    page,
    pageLimit,
    keyword,
    status
  );

  const listObjects = data?.listObjects || [];
  const totalRecords = data?.totalRecords || 0;
  const pageCount = Math.ceil(totalRecords / pageLimit);

  const handleSearch = () => {
    setSearchParams({ page: '1', limit: pageLimit.toString() });
  };

  return (
    <>
      <div className="grid gap-6 rounded-md p-4 pt-0 ">
        <h1 className="text-center font-bold">DANH SÁCH HÓA ĐƠN</h1>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Tìm kiếm theo mã đơn hàng..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Select
            value={status === undefined ? 'all' : status.toString()}
            onValueChange={(value) => {
              if (value === 'all') {
                setStatus(undefined);
              } else {
                setStatus(parseInt(value));
              }
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="1">Chờ thanh toán</SelectItem>
              <SelectItem value="2">Thành công</SelectItem>
              <SelectItem value="3">Đã hủy</SelectItem>
              <SelectItem value="4">Hết hạn</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            Tìm kiếm
          </Button>
        </div>

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
