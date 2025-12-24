import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BlogPostTargetAudience, BlogPostFilterDto } from '@/types/api.types';
import { useGetPopularTags } from '@/queries/blog.query';
import { Search, X } from 'lucide-react';

interface BlogPostFilterProps {
  filter: BlogPostFilterDto;
  onFilterChange: (filter: BlogPostFilterDto) => void;
}

export default function BlogPostFilter({
  filter,
  onFilterChange
}: BlogPostFilterProps) {
  const [keyword, setKeyword] = useState(filter.keyword || '');
  const { data: popularTags } = useGetPopularTags(10);
  const tags = Array.isArray(popularTags) ? popularTags : [];

  const handleFilterChange = (updates: Partial<BlogPostFilterDto>) => {
    onFilterChange({ ...filter, ...updates, page: 1 });
  };

  const handleSearch = () => {
    handleFilterChange({ keyword });
  };

  const clearFilters = () => {
    const clearedFilter: BlogPostFilterDto = {
      page: 1,
      pageSize: filter.pageSize
    };
    onFilterChange(clearedFilter);
    setKeyword('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bộ lọc</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tìm kiếm</label>
          <div className="flex gap-2">
            <Input
              placeholder="Tìm kiếm bài viết..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <Button onClick={handleSearch} size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Target Audience */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Đối tượng</label>
          <Select
            value={
              filter.targetAudience ? filter.targetAudience.toString() : 'all'
            }
            onValueChange={(value) => {
              handleFilterChange({
                targetAudience:
                  value === 'all'
                    ? undefined
                    : (parseInt(value) as BlogPostTargetAudience)
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tất cả" />
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
        </div>

        {/* Popular Tags */}
        {tags.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Tag phổ biến</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant={filter.tag === tag ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    handleFilterChange({
                      tag: filter.tag === tag ? undefined : tag
                    });
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Clear Filters */}
        {(filter.keyword || filter.targetAudience || filter.tag) && (
          <Button variant="outline" className="w-full" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" />
            Xóa bộ lọc
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
