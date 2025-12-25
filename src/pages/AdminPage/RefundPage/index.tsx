import BasePages from '@/components/shared/base-pages';
import { DataTable } from './list-data';
import { columns } from './list-data/columns';
import { useGetRefundList } from '@/queries/eventTicket.query';
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
import { useSearchParams } from 'react-router-dom';
import RefundStatistics from './components/RefundStatistics';

export default function RefundPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || 10);
  
  const [keyword, setKeyword] = useState('');
  const [isRefunded, setIsRefunded] = useState<boolean | undefined>(undefined);

  const { data, isLoading } = useGetRefundList({
    pageNumber: page,
    pageSize: limit,
    keyword,
    isRefunded
  });

  const handleSearch = () => {
    setSearchParams({ page: '1', limit: limit.toString() });
  };

  return (
    <BasePages
      className="relative flex-1 space-y-4 overflow-y-auto px-4"
      pageHead="Quản lý hoàn tiền"
      breadcrumbs={[{ title: 'Quản lý hoàn tiền', link: '/admin/refunds' }]}
    >
      <div className="space-y-4">
        {/* Statistics */}
        <RefundStatistics />

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Tìm kiếm theo tên người dùng hoặc sự kiện..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Select
            value={isRefunded === undefined ? 'all' : isRefunded.toString()}
            onValueChange={(value) => {
              if (value === 'all') {
                setIsRefunded(undefined);
              } else {
                setIsRefunded(value === 'true');
              }
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Trạng thái hoàn tiền" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="false">Chưa hoàn tiền</SelectItem>
              <SelectItem value="true">Đã hoàn tiền</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            Tìm kiếm
          </Button>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={data?.listObjects || []}
          totalCount={data?.totalRecords || 0}
          isLoading={isLoading}
        />
      </div>
    </BasePages>
  );
}
