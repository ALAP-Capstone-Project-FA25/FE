import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Lock, Unlock, Trash2 } from 'lucide-react';
import { BlogPost } from '@/types/api.types';
import { useRouter } from '@/routes/hooks';
import {
  useToggleBlogPostActive,
  useAdminDeleteBlogPost
} from '@/queries/admin-blog.query';
import { toast } from '@/components/ui/use-toast';
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

interface CellActionProps {
  data: BlogPost;
}

export function CellAction({ data }: CellActionProps) {
  const router = useRouter();
  const toggleActive = useToggleBlogPostActive();
  const deletePost = useAdminDeleteBlogPost();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleToggleActive = async () => {
    try {
      await toggleActive.mutateAsync(data.id);
      toast({
        title: 'Thành công',
        description: data.isActive ? 'Đã khóa bài viết' : 'Đã mở khóa bài viết'
      });
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error?.message || 'Có lỗi xảy ra',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost.mutateAsync(data.id);
      toast({
        title: 'Thành công',
        description: 'Đã xóa bài viết'
      });
      setShowDeleteDialog(false);
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error?.message || 'Có lỗi xảy ra',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/blog/${data.id}`)}>
            <Eye className="mr-2 h-4 w-4" />
            Xem
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleActive}>
            {data.isActive ? (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Khóa
              </>
            ) : (
              <>
                <Unlock className="mr-2 h-4 w-4" />
                Mở khóa
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bài viết "{data.title}"? Hành động này
              không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
