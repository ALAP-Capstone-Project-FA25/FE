import { ColumnDef } from '@tanstack/react-table';
import { useSearchParams } from 'react-router-dom';
import { CellAction } from './cell-action';
import { BlogPost, BlogPostTargetAudience } from '@/types/api.types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export const columns: ColumnDef<BlogPost>[] = [
  {
    accessorKey: 'STT',
    header: 'STT',
    enableSorting: true,
    cell: ({ row }) => {
      const [searchParams] = useSearchParams();
      const pageLimit = Number(searchParams.get('limit') || 10);
      const page = Number(searchParams.get('page') || 1);
      const rowIndex = row.index;
      const serialNumber = (page - 1) * pageLimit + rowIndex + 1;
      return <span>{serialNumber}</span>;
    }
  },
  {
    accessorKey: 'title',
    header: 'Tiêu đề',
    enableSorting: true,
    cell: ({ row }) => {
      const title = row.original.title;
      return <span className="line-clamp-2 font-medium">{title}</span>;
    }
  },
  {
    accessorKey: 'author',
    header: 'Tác giả',
    enableSorting: false,
    cell: ({ row }) => {
      const author = row.original.author;
      return (
        <span>
          {author?.firstName} {author?.lastName}
        </span>
      );
    }
  },
  {
    accessorKey: 'targetAudience',
    header: 'Đối tượng',
    enableSorting: true,
    cell: ({ row }) => {
      const audience = row.original.targetAudience;
      const getLabel = (a: BlogPostTargetAudience) => {
        switch (a) {
          case BlogPostTargetAudience.AS_LEVEL:
            return 'AS Level';
          case BlogPostTargetAudience.A2_LEVEL:
            return 'A2 Level';
          case BlogPostTargetAudience.BOTH:
            return 'Cả hai';
          default:
            return '';
        }
      };
      return (
        <Badge
          variant="outline"
          className={
            audience === BlogPostTargetAudience.AS_LEVEL
              ? 'border-blue-500 text-blue-700'
              : audience === BlogPostTargetAudience.A2_LEVEL
                ? 'border-green-500 text-green-700'
                : 'border-purple-500 text-purple-700'
          }
        >
          {getLabel(audience)}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'tags',
    header: 'Tags',
    enableSorting: false,
    cell: ({ row }) => {
      const tagsJson = row.original.tags;
      let tags: string[] = [];
      if (tagsJson) {
        try {
          tags = JSON.parse(tagsJson);
        } catch {
          tags = [];
        }
      }
      return (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tags.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{tags.length - 2}
            </Badge>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: 'isActive',
    header: 'Trạng thái',
    enableSorting: true,
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant={isActive ? 'default' : 'destructive'}>
          {isActive ? 'Đang hoạt động' : 'Đã khóa'}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Ngày tạo',
    enableSorting: true,
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return (
        <span>{format(new Date(date), 'dd/MM/yyyy', { locale: vi })}</span>
      );
    }
  },
  {
    id: 'actions',
    header: 'Hành động',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
