import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { useToast } from '@/components/ui/use-toast';
import { useDeleteMajor, useCreateUpdateMajor } from '@/queries/major.query';
import { Major } from '@/types/api.types';
import { Edit, MoreHorizontal, Trash } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQueryClient } from '@tanstack/react-query';

interface CellActionProps {
  data: Major;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editName, setEditName] = useState(data.name);
  const [editDescription, setEditDescription] = useState(data.description || '');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutateAsync: deleteMajor, isPending: isDeleting } = useDeleteMajor();
  const { mutateAsync: updateMajor, isPending: isUpdating } = useCreateUpdateMajor();

  const handleDelete = async () => {
    try {
      const [err] = await deleteMajor(data.id);

      if (err) {
        toast({
          title: 'Lỗi',
          description: err.message || 'Không thể xóa chuyên ngành',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Thành công!',
          description: 'Chuyên ngành đã được xóa',
          variant: 'default'
        });
        queryClient.invalidateQueries({ queryKey: ['majors'] });
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Có lỗi xảy ra',
        variant: 'destructive'
      });
    }
    setShowDeleteDialog(false);
  };

  const handleEdit = async () => {
    try {
      const [err] = await updateMajor({
        id: data.id,
        name: editName,
        description: editDescription
      });

      if (err) {
        toast({
          title: 'Lỗi',
          description: err.message || 'Không thể cập nhật chuyên ngành',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Thành công!',
          description: 'Chuyên ngành đã được cập nhật',
          variant: 'default'
        });
        queryClient.invalidateQueries({ queryKey: ['majors'] });
        setShowEditDialog(false);
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
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Mở menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600"
          >
            <Trash className="mr-2 h-4 w-4" /> Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa chuyên ngành</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tên chuyên ngành</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Tên chuyên ngành..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Mô tả</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Mô tả chuyên ngành..."
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isUpdating}
            >
              Hủy
            </Button>
            <Button onClick={handleEdit} disabled={isUpdating}>
              {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Chuyên ngành "{data.name}" sẽ bị
              xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
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
    </>
  );
};
