import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { useDeleteCourse } from '@/queries/course.query';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import EditCourseDialog from '../components/EditCourseDialog';

interface CellActionProps {
  data: any;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { mutateAsync: deleteCourse, isPending: isDeleting } =
    useDeleteCourse();

  const handleViewDetails = () => {
    navigate(`/admin/courses/${data.id}/topics`);
  };

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      const [err] = await deleteCourse(data.id);

      if (err) {
        const errorMessage =
          err?.data?.message || err.message || 'Có lỗi xảy ra khi xóa khóa học';
        toast({
          title: 'Lỗi',
          description: errorMessage,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Thành công',
          description: 'Khóa học đã được xóa thành công',
          variant: 'default'
        });

        // Refresh the courses list
        queryClient.invalidateQueries({ queryKey: ['courses'] });
        setIsDeleteDialogOpen(false);
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Có lỗi xảy ra',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleViewDetails}
        className="flex items-center gap-2"
      >
        <Eye className="h-4 w-4" />
        Xem chi tiết
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa khóa học</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa khóa học "{data.title}"? Hành động này
              không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditCourseDialog
        courseId={data.id}
        courseData={data}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
      />
    </div>
  );
};
