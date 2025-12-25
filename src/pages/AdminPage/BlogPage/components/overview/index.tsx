import { useSearchParams } from 'react-router-dom';
import ListData from '../../list-data';
import { DataTableSkeleton } from '@/components/shared/data-table-skeleton';
import { useGetAdminBlogPosts } from '@/queries/admin-blog.query';
import { BlogPostFilterDto, BlogPostTargetAudience } from '@/types/api.types';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export function OverViewTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') || 1);
  const pageLimit = Number(searchParams.get('limit') || 10);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [targetAudience, setTargetAudience] = useState<
    BlogPostTargetAudience | 'all'
  >(
    (searchParams.get('targetAudience') as BlogPostTargetAudience | 'all') ||
      'all'
  );
  const [status, setStatus] = useState<'all' | 'active' | 'locked'>(
    (searchParams.get('status') as any) || 'all'
  );

  const filter: BlogPostFilterDto = {
    page,
    pageSize: pageLimit,
    keyword: keyword || undefined,
    targetAudience:
      targetAudience !== 'all'
        ? (targetAudience as BlogPostTargetAudience)
        : undefined,
    isActive: status === 'all' ? undefined : status === 'active' ? true : false
  };

  const { data, isPending } = useGetAdminBlogPosts(filter);

  const listObjects = data?.listObjects || [];
  const totalRecords = data?.totalRecords || 0;
  const pageCount = Math.ceil(totalRecords / pageLimit);

  const handleSearch = () => {
    setSearchParams({
      page: '1',
      limit: pageLimit.toString(),
      keyword,
      targetAudience: targetAudience !== 'all' ? String(targetAudience) : '',
      status
    });
  };

  return (
    <>
      <div className="grid gap-6 rounded-md p-4 pt-0">
        <h1 className="text-center font-bold">DANH SÁCH BÀI VIẾT BLOG</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <Input
            placeholder="Tìm kiếm..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            className="max-w-xs"
          />
          <Select
            value={targetAudience === 'all' ? 'all' : String(targetAudience)}
            onValueChange={(value) =>
              setTargetAudience(
                value === 'all'
                  ? 'all'
                  : (parseInt(value) as BlogPostTargetAudience)
              )
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Đối tượng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value={BlogPostTargetAudience.AS_LEVEL.toString()}>
                AS Level
              </SelectItem>
              <SelectItem value={BlogPostTargetAudience.A2_LEVEL.toString()}>
                A2 Level
              </SelectItem>
              <SelectItem value={BlogPostTargetAudience.BOTH.toString()}>
                Cả hai
              </SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as any)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="locked">Đã khóa</SelectItem>
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
