'use client';

import type React from 'react';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useCreateUpdateLesson } from '@/queries/lesson.query';
import { CreateUpdateLessonDto } from '@/types/api.types';
import { useParams } from 'react-router-dom';
import { PlayCircle, Video, Clock, ListOrdered } from 'lucide-react';

/** --- Helper trích ID từ mọi dạng link YouTube --- */
function extractYouTubeId(url: string): string {
  if (!url) return '';
  try {
    const reg =
      /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
    const m = url.match(reg);
    if (m?.[1]) return m[1];

    const u = new URL(url);
    const v = u.searchParams.get('v');
    return v && v.length === 11 ? v : '';
  } catch {
    return '';
  }
}

/** --- Chuẩn hoá lại URL về dạng watch?v=... --- */
function normalizeYouTubeUrl(url: string): string {
  const id = extractYouTubeId(url);
  return id ? `https://www.youtube.com/watch?v=${id}` : url;
}

export default function Add() {
  const { topicId } = useParams<{ topicId: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState<number | ''>('');
  const [orderIndex, setOrderIndex] = useState<number | ''>('');
  const [isFree, setIsFree] = useState(false);
  const { toast } = useToast();
  const { mutateAsync: createLesson, isPending } = useCreateUpdateLesson();

  const videoId = useMemo(() => extractYouTubeId(videoUrl), [videoUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData: CreateUpdateLessonDto = {
      id: 0,
      title,
      description,
      content,
      videoUrl,
      duration: duration || 0,
      orderIndex: orderIndex || 0,
      isFree,
      topicId: parseInt(topicId || '0')
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
        setTitle('');
        setDescription('');
        setContent('');
        setVideoUrl('');
        setDuration('');
        setOrderIndex('');
        setIsFree(false);
        toast({
          title: 'Thành công!',
          description: `Bài học "${title}" đã được tạo thành công`,
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
          {/* LEFT COLUMN - Course Information */}
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-amber-50">
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <ListOrdered className="h-5 w-5 text-orange-600" />
                  Thông Tin Bài Học
                </CardTitle>
                <CardDescription>
                  Nhập các thông tin cơ bản về bài học
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Tiêu đề bài học <span className="text-orange-600">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Ví dụ: Giới thiệu về React Hooks"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="focus-visible:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="orderIndex"
                      className="flex items-center gap-1.5 text-sm font-medium"
                    >
                      <ListOrdered className="h-4 w-4 text-orange-600" />
                      Thứ tự <span className="text-orange-600">*</span>
                    </Label>
                    <Input
                      id="orderIndex"
                      type="number"
                      placeholder="1"
                      value={orderIndex}
                      onChange={(e) =>
                        setOrderIndex(
                          e.target.value ? parseInt(e.target.value, 10) : ''
                        )
                      }
                      required
                      className="focus-visible:ring-orange-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="duration"
                      className="flex items-center gap-1.5 text-sm font-medium"
                    >
                      <Clock className="h-4 w-4 text-orange-600" />
                      Thời lượng (phút)
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="30"
                      value={duration}
                      onChange={(e) =>
                        setDuration(
                          e.target.value ? parseInt(e.target.value, 10) : ''
                        )
                      }
                      className="focus-visible:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Mô tả <span className="text-orange-600">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Mô tả ngắn gọn về nội dung bài học..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={3}
                    className="resize-none focus-visible:ring-orange-500"
                  />
                  <p className="text-xs text-gray-500">
                    {description.length}/200 ký tự
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content" className="text-sm font-medium">
                    Nội dung chi tiết <span className="text-orange-600">*</span>
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Nội dung chi tiết về bài học, những kiến thức sẽ được học..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={6}
                    className="resize-none focus-visible:ring-orange-500"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN - Video Preview */}
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-amber-50">
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <Video className="h-5 w-5 text-orange-600" />
                  Video Bài Học
                </CardTitle>
                <CardDescription>
                  Thêm link YouTube để hiển thị video
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="videoUrl" className="text-sm font-medium">
                    URL Video YouTube
                  </Label>
                  <Input
                    id="videoUrl"
                    placeholder="https://youtu.be/... hoặc https://www.youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    onBlur={(e) =>
                      setVideoUrl(normalizeYouTubeUrl(e.target.value))
                    }
                    className="focus-visible:ring-orange-500"
                  />
                  <p className="text-xs text-gray-500">
                    Hỗ trợ: youtube.com/watch, youtu.be, youtube.com/shorts
                  </p>
                </div>

                {/* Video Preview */}
                <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-6">
                  {videoId ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                        Video đã sẵn sàng
                      </div>
                      <div className="overflow-hidden rounded-lg shadow-lg ring-2 ring-orange-500 ring-offset-2">
                        <div className="aspect-video w-full">
                          <iframe
                            className="h-full w-full"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title="YouTube preview"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    </div>
                  ) : videoUrl.trim() ? (
                    <div className="flex flex-col items-center gap-3 py-8 text-center">
                      <div className="rounded-full bg-red-100 p-3">
                        <Video className="h-8 w-8 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          URL chưa hợp lệ
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          Vui lòng kiểm tra lại định dạng link YouTube
                        </p>
                      </div>
                      <div className="mt-2 rounded-md bg-gray-100 px-3 py-2">
                        <p className="text-xs text-gray-700">
                          <strong>Ví dụ hợp lệ:</strong>
                        </p>
                        <code className="mt-1 block text-xs text-gray-600">
                          youtu.be/abc123
                        </code>
                        <code className="block text-xs text-gray-600">
                          youtube.com/watch?v=abc123
                        </code>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-12 text-center">
                      <div className="rounded-full bg-orange-100 p-4">
                        <Video className="h-10 w-10 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Chưa có video
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          Dán link YouTube vào ô bên trên để xem preview
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info Box */}
                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="flex gap-3">
                    <div className="mt-0.5">
                      <div className="rounded-full bg-blue-100 p-1.5">
                        <svg
                          className="h-4 w-4 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">Tips</p>
                      <ul className="mt-2 space-y-1 text-xs text-blue-800">
                        <li>• Video sẽ tự động cập nhật khi bạn dán link</li>
                        <li>• Hỗ trợ tất cả định dạng link YouTube</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <Button
            type="submit"
            disabled={isPending}
            className="min-w-[200px] bg-gradient-to-r from-orange-600 to-orange-500 px-8 py-6 text-base font-semibold shadow-lg transition-all hover:from-orange-700 hover:to-orange-600 hover:shadow-xl disabled:opacity-50"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang tạo bài học...
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
