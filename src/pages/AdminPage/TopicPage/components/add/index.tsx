'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useCreateUpdateTopic, useGetTopicsByCourseId } from '@/queries/topic.query';
import { CreateUpdateTopicDto } from '@/types/api.types';
import { useParams } from 'react-router-dom';

export default function Add() {
  const { courseId } = useParams<{ courseId: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [orderIndex, setOrderIndex] = useState<number | ''>('');
  const { toast } = useToast();
  const { mutateAsync: createTopic, isPending } = useCreateUpdateTopic();
  
  // Lấy danh sách chủ đề hiện có trong course để tự động setup orderIndex
  const { data: existingTopics } = useGetTopicsByCourseId(parseInt(courseId || '0'));

  // Tự động set orderIndex khi component mount hoặc khi danh sách chủ đề thay đổi
  useEffect(() => {
    if (existingTopics?.listObjects && existingTopics.listObjects.length > 0) {
      // Tìm orderIndex lớn nhất trong các chủ đề hiện có
      const maxOrderIndex = Math.max(
        ...existingTopics.listObjects.map((topic: any) => topic.orderIndex || 0)
      );
      // Set orderIndex mới = max + 1
      setOrderIndex(maxOrderIndex + 1);
    } else {
      // Nếu chưa có chủ đề nào, bắt đầu từ 1
      setOrderIndex(1);
    }
  }, [existingTopics]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData: CreateUpdateTopicDto = {
      id: 0, // 0 for create new
      title,
      description,
      orderIndex: orderIndex || 0,
      courseId: parseInt(courseId || '0')
    };

    try {
      const [err] = await createTopic(formData);

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
        
        // Tự động tăng orderIndex cho chủ đề tiếp theo
        if (typeof orderIndex === 'number') {
          setOrderIndex(orderIndex + 1);
        }
        
        toast({
          title: 'Thành công!',
          description: `Chủ đề "${currentTitle}" đã được tạo thành công`,
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
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Thêm Chủ Đề</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề chủ đề</Label>
            <Input
              id="title"
              placeholder="Tiêu đề chủ đề..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Input
              id="description"
              placeholder="Mô tả chủ đề..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderIndex">Thứ tự</Label>
            <div className="relative">
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
                className="pr-20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600 font-medium">
                Tự động
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Thứ tự được tự động setup dựa trên chủ đề cuối
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Đang tạo...' : 'Thêm Chủ Đề'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
