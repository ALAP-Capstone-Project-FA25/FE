import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import __helpers from '@/helpers';
import { useSearchParams } from 'react-router-dom';

// const StudentPaperStatus = {
//   UPLOADED: 0,
//   WAITING: 1,
//   DONE: 2
// };

export const columns: ColumnDef<any>[] = [
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
    header: 'Tiêu đề khóa học',
    enableSorting: true
  },
  {
    accessorKey: 'imageUrl',
    header: 'Ảnh khóa học',
    enableSorting: true,
    cell: ({ row }) => {
      const imageUrl = row.original.imageUrl;
      return (
        <img
          src={imageUrl}
          alt="Ảnh khóa học"
          className="h-10 w-10 rounded object-cover"
        />
      );
    }
  },
  {
    accessorKey: 'description',
    header: 'Mô tả',
    enableSorting: false,
    cell: ({ row }) => {
      const description = row.original.description;
      return <span className="max-w-xs truncate">{description}</span>;
    }
  },
  // Ẩn cột giá gốc và giá khuyến mãi
  // {
  //   accessorKey: 'price',
  //   header: 'Giá gốc (vnđ)',
  //   enableSorting: false,
  //   cell: ({ row }) => {
  //     const price = row.original.price;
  //     return <span>{__helpers.formatCurrency(price)} đ</span>;
  //   }
  // },
  // {
  //   accessorKey: 'salePrice',
  //   header: 'Giá khuyến mãi (vnđ)',
  //   enableSorting: false,
  //   cell: ({ row }) => {
  //     const salePrice = row.original.salePrice;
  //     return <span>{__helpers.formatCurrency(salePrice)} đ</span>;
  //   }
  // },

  {
    accessorKey: 'category',
    header: 'Môn học',
    enableSorting: false,
    cell: ({ row }) => {
      const category = row.original.category;
      return <span>{category.name}</span>;
    }
  },

  {
    accessorKey: 'category',
    header: 'Số học viên',
    enableSorting: false,
    cell: ({ row }) => {
      const userCourses = row.original.userCourses;
      return <span>{userCourses.length} học viên</span>;
    }
  },

  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
