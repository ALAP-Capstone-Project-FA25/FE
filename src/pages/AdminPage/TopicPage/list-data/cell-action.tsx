import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useDeleteTopic } from '@/queries/topic.query';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateUpdateTopic } from '@/queries/topic.query';
import { CreateUpdateTopicDto } from '@/types/api.types';

interface CellActionProps {
  data: any;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(data.title || '');
  const [editDescription, setEditDescription] = useState(
    data.description || ''
  );
  const [editOrderIndex, setEditOrderIndex] = useState(data.orderIndex || 0);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutateAsync: deleteTopic } = useDeleteTopic();
  const { mutateAsync: updateTopic } = useCreateUpdateTopic();

  const handleViewLessons = () => {
    navigate(`/admin/courses/${data.courseId}/topics/${data.id}/lessons`);
  };

  const handleDelete = async () => {
    try {
      const [err] = await deleteTopic(data.id);
      if (err) {
        toast({
          title: 'Lỗi',
          description: err.message || 'Có lỗi xảy ra',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Thành công!',
          description: 'Chủ đề đã được xóa',
          variant: 'default'
        });
        setIsDeleteOpen(false);
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Có lỗi xảy ra',
        variant: 'destructive'
      });
    }
  };

  const handleUpdate = async () => {
    const updateData: CreateUpdateTopicDto = {
      id: data.id,
      title: editTitle,
      description: editDescription,
      orderIndex: editOrderIndex,
      courseId: data.courseId
    };

    try {
      const [err] = await updateTopic(updateData);
      if (err) {
        toast({
          title: 'Lỗi',
          description: err.message || 'Có lỗi xảy ra',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Thành công!',
          description: 'Chủ đề đã được cập nhật',
          variant: 'default'
        });
        setIsEditOpen(false);
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
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewLessons}
          className="flex items-center gap-1 bg-green-500 text-white hover:bg-green-600"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="bg-orange-500 text-white hover:bg-orange-600"
          size="sm"
          onClick={() => setIsEditOpen(true)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDeleteOpen(true)}
          className="bg-red-500 text-white hover:bg-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa chủ đề</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editTitle">Tiêu đề</Label>
              <Input
                id="editTitle"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDescription">Mô tả</Label>
              <Input
                id="editDescription"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editOrderIndex">Thứ tự</Label>
              <Input
                id="editOrderIndex"
                type="number"
                value={editOrderIndex}
                onChange={(e) =>
                  setEditOrderIndex(parseInt(e.target.value) || 0)
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdate}>Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p>Bạn có chắc chắn muốn xóa chủ đề này không?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
