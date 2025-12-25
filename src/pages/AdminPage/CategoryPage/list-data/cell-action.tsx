import { Button } from '@/components/ui/button';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import {
  useDeleteCategory,
  useCreateUpdateCategory
} from '@/queries/category.query';
import { useGetListMajorByPaging } from '@/queries/major.query';
import { Category } from '@/types/api.types';
import {
  Edit,
  MoreHorizontal,
  Trash,
  Network,
  Eye,
  BookOpen
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@/routes/hooks';
import { ScrollArea } from '@/components/ui/scroll-area';
import SingleFileUpload from '@/components/shared/single-file-upload';

interface CellActionProps {
  data: Category;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCoursesDialog, setShowCoursesDialog] = useState(false);
  const [editName, setEditName] = useState(data.name);
  const [editDescription, setEditDescription] = useState(
    data.description || ''
  );
  const [editImageUrl, setEditImageUrl] = useState(data.imageUrl || '');
  const [editMajorId, setEditMajorId] = useState(
    data.majorId?.toString() || ''
  );

  // Reset form khi mở dialog
  useEffect(() => {
    if (showEditDialog) {
      setEditName(data.name);
      setEditDescription(data.description || '');
      setEditImageUrl(data.imageUrl || '');
      setEditMajorId(data.majorId?.toString() || '');
    }
  }, [showEditDialog, data]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { mutateAsync: deleteCategory, isPending: isDeleting } =
    useDeleteCategory();
  const { mutateAsync: updateCategory, isPending: isUpdating } =
    useCreateUpdateCategory();
  const { data: majorsData } = useGetListMajorByPaging(1, 100, '');

  const majors = majorsData?.listObjects || [];
  const courses = data.courses || [];

  const handleDelete = async () => {
    try {
      const [err] = await deleteCategory(data.id);

      if (err) {
        toast({
          title: 'Lỗi',
          description: err.message || 'Không thể xóa môn học',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Thành công!',
          description: 'Môn học đã được xóa',
          variant: 'default'
        });
        queryClient.invalidateQueries({ queryKey: ['categories'] });
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
    if (!editMajorId) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn chuyên ngành',
        variant: 'destructive'
      });
      return;
    }

    try {
      const [err] = await updateCategory({
        id: data.id,
        name: editName,
        description: editDescription,
        imageUrl: editImageUrl,
        majorId: Number(editMajorId)
      });

      if (err) {
        toast({
          title: 'Lỗi',
          description: err.message || 'Không thể cập nhật môn học',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Thành công!',
          description: 'Môn học đã được cập nhật',
          variant: 'default'
        });
        queryClient.invalidateQueries({ queryKey: ['categories'] });
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
          <DropdownMenuItem onClick={() => setShowCoursesDialog(true)}>
            <Eye className="mr-2 h-4 w-4" /> Xem khóa học ({courses.length})
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/admin/knowledge-graph/${data.id}`)}
          >
            <Network className="mr-2 h-4 w-4" /> Knowledge Graph
          </DropdownMenuItem>
          <DropdownMenuSeparator />
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

      {/* Courses Dialog */}
      <Dialog open={showCoursesDialog} onOpenChange={setShowCoursesDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Danh sách khóa học - {data.name} ({courses.length})
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BookOpen className="mb-2 h-12 w-12 text-gray-400" />
                <p className="text-gray-500">Chưa có khóa học nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map((course, index) => (
                  <div
                    key={course.id}
                    className="flex items-start gap-3 rounded-lg border p-3 hover:bg-gray-50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{course.title}</h4>
                      <p className="line-clamp-2 text-sm text-gray-600">
                        {course.description}
                      </p>
                    </div>
                    {course.imageUrl && (
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="h-16 w-16 rounded object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa môn học</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tên môn học</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Tên môn học..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Mô tả</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Mô tả môn học..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Ảnh minh họa</Label>
              {editImageUrl && (
                <div className="mb-2">
                  <img
                    src={editImageUrl}
                    alt="Current"
                    className="h-24 w-24 rounded object-cover"
                  />
                  <p className="mt-1 text-xs text-gray-500">Ảnh hiện tại</p>
                </div>
              )}
              <SingleFileUpload
                onFileUploaded={(url) => setEditImageUrl(url)}
                acceptedFileTypes={['image/*']}
                maxFileSize={5}
                placeholder="Kéo thả ảnh mới hoặc click để chọn"
                autoUpload={true}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-major">Chuyên ngành</Label>
              <Select value={editMajorId} onValueChange={setEditMajorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chuyên ngành..." />
                </SelectTrigger>
                <SelectContent>
                  {majors.map((major) => (
                    <SelectItem key={major.id} value={major.id.toString()}>
                      {major.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              Hành động này không thể hoàn tác. Môn học "{data.name}" sẽ bị xóa
              vĩnh viễn.
              {courses.length > 0 && (
                <span className="mt-2 block font-semibold text-red-600">
                  Cảnh báo: Môn học này có {courses.length} khóa học!
                </span>
              )}
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
