import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useCreateUpdateLesson, useGetLessonsByTopicId } from '@/queries/lesson.query';
import { CreateUpdateLessonDto, LessonType } from '@/types/api.types';
import { useParams } from 'react-router-dom';
import { PlayCircle, Video, Clock, ListOrdered } from 'lucide-react';
import { LessonTypeSelector } from './LessonTypeSelector';
import { DocumentSection } from './DocumentSection';

function extractYouTubeId(url: string): string {
  if (!url) return '';
  try {
    const reg = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
    const m = url.match(reg);
    if (m?.[1]) return m[1];
    const u = new URL(url);
    const v = u.searchParams.get('v');
    return v && v.length === 11 ? v : '';
  } catch {
    return '';
  }
}

function normalizeYouTubeUrl(url: string): string {
  const id = extractYouTubeId(url);
  return id ? `https://www.youtube.com/watch?v=${id}` : url;
}

export default function AddLessonForm() {
  const { topicId } = useParams<{ topicId: string }>();
  const [lessonType, setLessonType] = useState<LessonType>(LessonType.VIDEO);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [duration, setDuration] = useState<number | ''>('');
  const [orderIndex, setOrderIndex] = useState<number | ''>('');
  const [isFree, setIsFree] = useState(false);
  const { toast } = useToast();
  const { mutateAsync: createLesson, isPending } = useCreateUpdateLesson();
  
  // Lấy danh sách bài học hiện có trong topic để tự động setup orderIndex
  const { data: existingLessons } = useGetLessonsByTopicId(parseInt(topicId || '0'));

  const videoId = useMemo(() => extractYouTubeId(videoUrl), [videoUrl]);

  // Tự động set orderIndex khi component mount hoặc khi danh sách bài học thay đổi
  useEffect(() => {
    if (existingLessons?.listObjects && existingLessons.listObjects.length > 0) {
      // Tìm orderIndex lớn nhất trong các bài học hiện có
      const maxOrderIndex = Math.max(
        ...existingLessons.listObjects.map((lesson: any) => lesson.orderIndex || 0)
      );
      // Set orderIndex mới = max + 1
      setOrderIndex(maxOrderIndex + 1);
    } else {
      // Nếu chưa có bài học nào, bắt đầu từ 1
      setOrderIndex(1);
    }
  }, [existingLessons]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData: CreateUpdateLessonDto = {
      id: 0,
      title,
      description,
      content,
      videoUrl: lessonType === LessonType.VIDEO ? videoUrl : '',
      duration: duration || 0,
      orderIndex: orderIndex || 0,
      isFree,
      topicId: parseInt(topicId || '0'),
      lessonType,
      documentUrl: lessonType === LessonType.DOCUMENT ? documentUrl : undefined,
      documentContent: lessonType === LessonType.DOCUMENT ? documentContent : undefined
    };

    try {
      const [err] = await createLesson(formData);

      if (err) {
        toast({
          title: 'Lỗi',
          description: err.message || 'Có lỗi xảy ra',
          variant: 'destructive'
        });
      } else {
        // Reset form
        const currentTitle = title;
        setTitle('');
        setDescription('');
        setContent('');
        setVideoUrl('');
        setDocumentUrl('');
        setDocumentContent('');
        setDuration('');
        setIsFree(false);
        
        // Tự động tăng orderIndex cho bài học tiếp theo
        if (typeof orderIndex === 'number') {
          setOrderIndex(orderIndex + 1);
        }
        
        toast({
          title: 'Thành công!',
          description: `Bài học "${currentTitle}" đã được tạo thành công`,
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

  return (
    <div className="container mx-auto px-4 py-8">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-amber-50">
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <ListOrdered className="h-5 w-5 text-orange-600" />
                  Thông Tin Bài Học
                </CardTitle>
                <CardDescription>Nhập các thông tin cơ bản về bài học</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <LessonTypeSelector value={lessonType} onChange={setLessonType} />

                <div className="space-y-2">
                  <Label htmlFor="title">
                    Tiêu đề bài học <span className="text-orange-600">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Ví dụ: Giới thiệu về React Hooks"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderIndex">
                      <ListOrdered className="mr-1 inline h-4 w-4" />
                      Thứ tự <span className="text-orange-600">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="orderIndex"
                        type="number"
                        placeholder="1"
                        value={orderIndex}
                        onChange={(e) => setOrderIndex(e.target.value ? parseInt(e.target.value) : '')}
                        required
                        className="pr-20"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600 font-medium">
                        Tự động
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Thứ tự được tự động setup dựa trên bài học cuối
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">
                      <Clock className="mr-1 inline h-4 w-4" />
                      Thời lượng (phút)
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="30"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : '')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Mô tả <span className="text-orange-600">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Mô tả ngắn gọn về nội dung bài học..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">
                    Nội dung chi tiết <span className="text-orange-600">*</span>
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Nội dung chi tiết về bài học..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {lessonType === LessonType.VIDEO ? (
              <Card className="shadow-sm">
                <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-amber-50">
                  <CardTitle className="flex items-center gap-2 text-orange-900">
                    <Video className="h-5 w-5 text-orange-600" />
                    Video Bài Học
                  </CardTitle>
                  <CardDescription>Thêm link YouTube để hiển thị video</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">URL Video YouTube</Label>
                    <Input
                      id="videoUrl"
                      placeholder="https://youtu.be/... hoặc https://www.youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      onBlur={(e) => setVideoUrl(normalizeYouTubeUrl(e.target.value))}
                    />
                  </div>

                  <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-6">
                    {videoId ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                          Video đã sẵn sàng
                        </div>
                        <div className="overflow-hidden rounded-lg shadow-lg">
                          <div className="aspect-video w-full">
                            <iframe
                              className="h-full w-full"
                              src={`https://www.youtube.com/embed/${videoId}`}
                              title="YouTube preview"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 py-12 text-center">
                        <Video className="h-10 w-10 text-orange-600" />
                        <p className="font-medium text-gray-900">Chưa có video</p>
                        <p className="text-sm text-gray-600">Dán link YouTube vào ô bên trên</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <DocumentSection
                documentUrl={documentUrl}
                documentContent={documentContent}
                onDocumentUrlChange={setDocumentUrl}
                onDocumentContentChange={setDocumentContent}
              />
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            type="submit"
            disabled={isPending}
            className="min-w-[200px] bg-gradient-to-r from-orange-600 to-orange-500 px-8 py-6"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang tạo...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                Thêm Bài Học
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
