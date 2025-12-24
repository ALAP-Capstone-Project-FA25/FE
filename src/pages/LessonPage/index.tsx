'use client';

import { useState } from 'react';
import {
  useGetLessonsByPaging,
  useCreateUpdateLesson,
  useDeleteLesson
} from '@/queries/lesson.query';
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
import { Plus, Search, Edit, Trash2, Play, Clock } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';

export default function LessonPage() {
  const [pagingModel, setPagingModel] = useState({
    page: 1,
    pageSize: 10,
    keyword: ''
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);

  const {
    data: lessonsData,
    isLoading,
    refetch
  } = useGetLessonsByPaging(pagingModel);
  const { mutateAsync: createUpdateLesson, isPending: isCreating } =
    useCreateUpdateLesson();
  const { mutateAsync: deleteLesson, isPending: isDeleting } =
    useDeleteLesson();

  const handleSearch = (keyword: string) => {
    setPagingModel((prev) => ({ ...prev, keyword, page: 1 }));
  };

  const handleCreateUpdate = async (formData: any) => {
    try {
      await createUpdateLesson(formData);
      setIsCreateDialogOpen(false);
      setEditingLesson(null);
      refetch();
    } catch (error) {
      console.error('Error creating/updating lesson:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa bài học này?')) {
      try {
        await deleteLesson(id);
        refetch();
      } catch (error) {
        console.error('Error deleting lesson:', error);
      }
    }
  };

  const handleEdit = (lesson: any) => {
    setEditingLesson(lesson);
    setIsCreateDialogOpen(true);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quản lý Bài học</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingLesson(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm bài học
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingLesson ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}
              </DialogTitle>
              <DialogDescription>
                {editingLesson
                  ? 'Cập nhật thông tin bài học'
                  : 'Nhập thông tin bài học mới'}
              </DialogDescription>
            </DialogHeader>
            <LessonForm
              lesson={editingLesson}
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
            placeholder="Tìm kiếm bài học..."
            value={pagingModel.keyword}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lessons List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div>Đang tải...</div>
        ) : lessonsData?.data?.items?.length > 0 ? (
          lessonsData.data.items.map((lesson: any) => (
            <Card key={lesson.id} className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {lesson.title}
                  {lesson.isFree && (
                    <Badge variant="secondary" className="text-xs">
                      Miễn phí
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>{lesson.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Thứ tự:
                    </span>
                    <Badge variant="outline">{lesson.orderIndex}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Thời lượng:
                    </span>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3" />
                      {formatDuration(lesson.duration)}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Chủ đề:
                    </span>
                    <span className="text-sm">
                      {lesson.topic?.title || 'N/A'}
                    </span>
                  </div>
                  {lesson.videoUrl && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Play className="h-3 w-3" />
                      <span>Có video</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(lesson)}
                  >
                    <Edit className="mr-1 h-4 w-4" />
                    Sửa
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(lesson.id)}
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
            Không có bài học nào
          </div>
        )}
      </div>
    </div>
  );
}

// Lesson Form Component
function LessonForm({ lesson, onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    id: lesson?.id || 0,
    title: lesson?.title || '',
    description: lesson?.description || '',
    content: lesson?.content || '',
    videoUrl: lesson?.videoUrl || '',
    duration: lesson?.duration || 0,
    orderIndex: lesson?.orderIndex || 0,
    isFree: lesson?.isFree || false,
    topicId: lesson?.topicId || 1
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Tên bài học</Label>
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

      <div className="space-y-2">
        <Label htmlFor="content">Nội dung</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, content: e.target.value }))
          }
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="videoUrl">URL Video</Label>
        <Input
          id="videoUrl"
          value={formData.videoUrl}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))
          }
          placeholder="https://..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Thời lượng (phút)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                duration: parseInt(e.target.value) || 0
              }))
            }
            required
          />
        </div>

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
      </div>

      <div className="space-y-2">
        <Label htmlFor="topicId">Chủ đề</Label>
        <Select
          value={formData.topicId.toString()}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, topicId: parseInt(value) }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn chủ đề" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Chủ đề 1</SelectItem>
            <SelectItem value="2">Chủ đề 2</SelectItem>
            <SelectItem value="3">Chủ đề 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isFree"
          checked={formData.isFree}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({ ...prev, isFree: !!checked }))
          }
        />
        <Label htmlFor="isFree">Bài học miễn phí</Label>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Đang xử lý...' : lesson ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </DialogFooter>
    </form>
  );
}
