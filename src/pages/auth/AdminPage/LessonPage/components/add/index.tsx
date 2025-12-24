'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useCreateUpdateLesson } from '@/queries/lesson.query';
import { CreateUpdateLessonDto } from '@/types/api.types';
import { useParams } from 'react-router-dom';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData: CreateUpdateLessonDto = {
      id: 0, // 0 for create new
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
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Thêm Bài Học</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề bài học</Label>
              <Input
                id="title"
                placeholder="Tiêu đề bài học..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderIndex">Thứ tự</Label>
              <Input
                id="orderIndex"
                type="number"
                placeholder="Thứ tự..."
                value={orderIndex}
                onChange={(e) =>
                  setOrderIndex(
                    e.target.value ? parseInt(e.target.value, 10) : ''
                  )
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Mô tả bài học..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Nội dung</Label>
            <Textarea
              id="content"
              placeholder="Nội dung bài học..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="videoUrl">URL Video</Label>
              <Input
                id="videoUrl"
                placeholder="https://..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Thời lượng (phút)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="Thời lượng..."
                value={duration}
                onChange={(e) =>
                  setDuration(
                    e.target.value ? parseInt(e.target.value, 10) : ''
                  )
                }
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="isFree" checked={isFree} onCheckedChange={setIsFree} />
            <Label htmlFor="isFree">Bài học miễn phí</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Đang tạo...' : 'Thêm Bài Học'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
