'use client';

import { useState } from 'react';
import {
  useGetTopicsByPaging,
  useCreateUpdateTopic,
  useDeleteTopic
} from '@/queries/topic.query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export default function TopicPage() {
  const [pagingModel, setPagingModel] = useState({
    page: 1,
    pageSize: 10,
    keyword: ''
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<any>(null);

  const {
    data: topicsData,
    isLoading,
    refetch
  } = useGetTopicsByPaging(pagingModel);
  const { mutateAsync: createUpdateTopic, isPending: isCreating } =
    useCreateUpdateTopic();
  const { mutateAsync: deleteTopic, isPending: isDeleting } = useDeleteTopic();

  const handleSearch = (keyword: string) => {
    setPagingModel((prev) => ({ ...prev, keyword, page: 1 }));
  };

  const handleCreateUpdate = async (formData: any) => {
    try {
      await createUpdateTopic(formData);
      setIsCreateDialogOpen(false);
      setEditingTopic(null);
      refetch();
    } catch (error) {
      console.error('Error creating/updating topic:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa chủ đề này?')) {
      try {
        await deleteTopic(id);
        refetch();
      } catch (error) {
        console.error('Error deleting topic:', error);
      }
    }
  };

  const handleEdit = (topic: any) => {
    setEditingTopic(topic);
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quản lý Chủ đề</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTopic(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm chủ đề
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingTopic ? 'Chỉnh sửa chủ đề' : 'Thêm chủ đề mới'}
              </DialogTitle>
              <DialogDescription>
                {editingTopic
                  ? 'Cập nhật thông tin chủ đề'
                  : 'Nhập thông tin chủ đề mới'}
              </DialogDescription>
            </DialogHeader>
            <TopicForm
              topic={editingTopic}
              onSubmit={handleCreateUpdate}
              isLoading={isCreating}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm chủ đề..."
            value={pagingModel.keyword}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Topics List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div>Đang tải...</div>
        ) : topicsData?.data?.items?.length > 0 ? (
          topicsData.data.items.map((topic: any) => (
            <Card key={topic.id} className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">{topic.title}</CardTitle>
                <CardDescription>{topic.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Thứ tự:
                    </span>
                    <Badge variant="outline">{topic.orderIndex}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Khóa học:
                    </span>
                    <span className="text-sm">
                      {topic.course?.title || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(topic)}
                  >
                    <Edit className="mr-1 h-4 w-4" />
                    Sửa
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(topic.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Xóa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-8 text-center text-muted-foreground">
            Không có chủ đề nào
          </div>
        )}
      </div>
    </div>
  );
}

// Topic Form Component
function TopicForm({ topic, onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    id: topic?.id || 0,
    title: topic?.title || '',
    description: topic?.description || '',
    orderIndex: topic?.orderIndex || 0,
    courseId: topic?.courseId || 1
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Tên chủ đề</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="orderIndex">Thứ tự</Label>
          <Input
            id="orderIndex"
            type="number"
            value={formData.orderIndex}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                orderIndex: parseInt(e.target.value) || 0
              }))
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="courseId">Khóa học</Label>
          <Select
            value={formData.courseId.toString()}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, courseId: parseInt(value) }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn khóa học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Khóa học 1</SelectItem>
              <SelectItem value="2">Khóa học 2</SelectItem>
              <SelectItem value="3">Khóa học 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Đang xử lý...' : topic ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </DialogFooter>
    </form>
  );
}
