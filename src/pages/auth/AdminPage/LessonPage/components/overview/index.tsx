import { useGetLessonsByTopicId } from '@/queries/lesson.query';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Play, Clock, Lock, Unlock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useDeleteLesson } from '@/queries/lesson.query';
import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useCreateUpdateLesson } from '@/queries/lesson.query';
import { CreateUpdateLessonDto } from '@/types/api.types';
import { getYouTubePreview, normalizeYouTubeUrl } from '@/helpers/youtube';
export function OverViewTab() {
  const { topicId } = useParams<{ topicId: string }>();
  const { data, isPending } = useGetLessonsByTopicId(parseInt(topicId || '0'));
  const { toast } = useToast();
  const { mutateAsync: deleteLesson } = useDeleteLesson();
  const { mutateAsync: updateLesson } = useCreateUpdateLesson();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editDuration, setEditDuration] = useState(0);
  const [editOrderIndex, setEditOrderIndex] = useState(0);
  const [editIsFree, setEditIsFree] = useState(false);
  const preview = useMemo(
    () =>
      getYouTubePreview(editVideoUrl, {
        autoplay: 0,
        modestbranding: 1,
        rel: 0
      }),
    [editVideoUrl]
  );
  const lessons = data?.listObjects || [];

  const handleDelete = async (lessonId: number) => {
    try {
      const [err] = await deleteLesson(lessonId);
      if (err) {
        toast({
          title: 'Lỗi',
          description: err.message || 'Có lỗi xảy ra',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Thành công!',
          description: 'Bài học đã được xóa',
          variant: 'default'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Có lỗi xảy ra',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (lesson: any) => {
    setEditingLesson(lesson);
    setEditTitle(lesson.title || '');
    setEditDescription(lesson.description || '');
    setEditContent(lesson.content || '');
    setEditVideoUrl(lesson.videoUrl || '');
    setEditDuration(lesson.duration || 0);
    setEditOrderIndex(lesson.orderIndex || 0);
    setEditIsFree(lesson.isFree || false);
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingLesson) return;

    const updateData: CreateUpdateLessonDto = {
      id: editingLesson.id,
      title: editTitle,
      description: editDescription,
      content: editContent,
      videoUrl: editVideoUrl,
      duration: editDuration,
      orderIndex: editOrderIndex,
      isFree: editIsFree,
      topicId: editingLesson.topicId
    };

    try {
      const [err] = await updateLesson(updateData);
      if (err) {
        toast({
          title: 'Lỗi',
          description: err.message || 'Có lỗi xảy ra',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Thành công!',
          description: 'Bài học đã được cập nhật',
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

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (isPending) {
    return (
      <div className="grid gap-6 rounded-md p-4 pt-0">
        <h1 className="text-center font-bold">DANH SÁCH BÀI HỌC</h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                <div className="h-3 w-1/2 rounded bg-gray-200"></div>
              </CardHeader>
              <CardContent>
                <div className="mb-2 h-3 w-full rounded bg-gray-200"></div>
                <div className="h-3 w-2/3 rounded bg-gray-200"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 rounded-md p-4 pt-0">
        <h1 className="text-center font-bold">DANH SÁCH BÀI HỌC</h1>

        {lessons.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">Chưa có bài học nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson: any) => (
              <Card
                key={lesson.id}
                className="transition-shadow hover:shadow-lg"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2 text-lg">
                        {lesson.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="line-clamp-2 text-sm text-gray-600">
                    {lesson.description}
                  </p>

                  {lesson.duration > 0 && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="mr-1 h-4 w-4" />
                      {formatDuration(lesson.duration)}
                    </div>
                  )}

                  {lesson.videoUrl && (
                    <div className="flex items-center text-sm text-blue-600">
                      <Play className="mr-1 h-4 w-4" />
                      Có video
                    </div>
                  )}
                </CardContent>

                <div className="px-6 pb-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(lesson)}
                      className="flex-1"
                    >
                      <Edit className="mr-1 h-4 w-4" />
                      Sửa
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(lesson.id)}
                      className="flex-1"
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Xóa
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa bài học</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="editTitle">Tiêu đề</Label>
                <Input
                  id="editTitle"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
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

            <div className="space-y-2">
              <Label htmlFor="editDescription">Mô tả</Label>
              <Textarea
                id="editDescription"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editContent">Nội dung</Label>
              <Textarea
                id="editContent"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="editVideoUrl">URL Video</Label>
                <Input
                  id="editVideoUrl"
                  placeholder="https://youtu.be/... hoặc https://www.youtube.com/watch?v=..."
                  value={editVideoUrl}
                  onChange={(e) => setEditVideoUrl(e.target.value)}
                  onBlur={(e) =>
                    setEditVideoUrl(normalizeYouTubeUrl(e.target.value))
                  }
                />

                {/* Preview YouTube */}
                <div className="mt-2 rounded-md border bg-muted/40 p-2">
                  {preview.valid ? (
                    <div className="aspect-video w-full overflow-hidden rounded">
                      <iframe
                        className="h-full w-full"
                        src={preview.embedUrl!}
                        title="YouTube preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  ) : editVideoUrl.trim() ? (
                    <p className="text-sm text-muted-foreground">
                      URL chưa hợp lệ. Dán link dạng{' '}
                      <code>youtu.be/&lt;id&gt;</code> hoặc{' '}
                      <code>youtube.com/watch?v=&lt;id&gt;</code>.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nhập URL để xem preview.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editDuration">Thời lượng (phút)</Label>
                <Input
                  id="editDuration"
                  type="number"
                  value={editDuration}
                  onChange={(e) =>
                    setEditDuration(parseInt(e.target.value) || 0)
                  }
                />
              </div>
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
    </>
  );
}
