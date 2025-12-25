import { useState } from 'react';
import { useRouter } from '@/routes/hooks';
import { BlogPostTargetAudience, BlogPostFilterDto } from '@/types/api.types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { useGetBlogPosts, useGetPopularTags } from '@/queries/blog.query';
import { DataTableSkeleton } from '@/components/shared/data-table-skeleton';
import BlogPostCard from '@/components/blog/BlogPostCard';
import { Badge } from '@/components/ui/badge';
import { useGetMyInfo } from '@/queries/user.query';
import { USER_ROLE } from '@/constants/data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export default function BlogPage() {
  const router = useRouter();
  const { data: infoUser } = useGetMyInfo();
  const [keyword, setKeyword] = useState('');
  const [targetAudience, setTargetAudience] = useState<
    BlogPostTargetAudience | 'all'
  >('all');
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { data: popularTags } = useGetPopularTags(10);
  const tags = Array.isArray(popularTags) ? popularTags : [];

  // Prepare filter for API
  const filter: BlogPostFilterDto = {
    page: currentPage,
    pageSize,
    keyword: keyword.trim() || undefined,
    targetAudience: targetAudience !== 'all' ? targetAudience : undefined,
    tag: selectedTag
  };

  // Fetch data from API
  const { data, isPending, error } = useGetBlogPosts(filter);

  const blogPosts = data?.listObjects || [];
  const totalRecords = data?.totalRecords || 0;
  const totalPages = Math.ceil(totalRecords / pageSize);

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    if (!value.trim()) {
      setCurrentPage(1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Blog</h1>
            <p className="text-gray-600">
              Khám phá các bài viết về lập trình và công nghệ
            </p>
          </div>
          {infoUser?.role === USER_ROLE.USER && (
            <Button
              onClick={() => router.push('/blog/create')}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tạo bài viết
            </Button>
          )}
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-wrap gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Tìm kiếm bài viết..."
              value={keyword}
              onChange={(e) => handleKeywordChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="pl-10"
            />
          </div>

          <Select
            value={targetAudience.toString()}
            onValueChange={(value) =>
              setTargetAudience(
                value === 'all'
                  ? 'all'
                  : (Number(value) as BlogPostTargetAudience)
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

          <Button onClick={handleSearch} className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Tìm kiếm
          </Button>
        </div>

        {/* Popular Tags Filter */}
        {tags.length > 0 && (
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Lọc theo tag:
              </span>
              {selectedTag && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedTag(undefined);
                    setCurrentPage(1);
                  }}
                  className="h-6 text-xs"
                >
                  Xóa tag
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-orange-100"
                  onClick={() => {
                    setSelectedTag(selectedTag === tag ? undefined : tag);
                    setCurrentPage(1);
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isPending && (
          <div className="space-y-4">
            <DataTableSkeleton columnCount={1} />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="py-12 text-center">
            <p className="text-red-500">
              Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.
            </p>
          </div>
        )}

        {/* Blog List */}
        {!isPending && !error && (
          <>
            {blogPosts.length > 0 ? (
              <div className="space-y-4">
                {blogPosts.map((post) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-gray-500">Không tìm thấy bài viết nào.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  Trang trước
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? 'default' : 'outline'
                        }
                        onClick={() => setCurrentPage(pageNum)}
                        size="sm"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && <span className="text-gray-500">...</span>}
                </div>

                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Trang sau
                </Button>
              </div>
            )}
          </>
        )}

        {/* Stats */}
        {!isPending && !error && totalRecords > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            Hiển thị {blogPosts.length} trong tổng số {totalRecords} bài viết
          </div>
        )}
      </div>
    </div>
  );
}
