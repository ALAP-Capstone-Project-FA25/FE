'use client';

import type React from 'react';

import { useState } from 'react';
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
import { useCreateUpdateTopic } from '@/queries/topic.query';
import { CreateUpdateTopicDto } from '@/types/api.types';
import { useParams } from 'react-router-dom';

export default function Add() {
  const { courseId } = useParams<{ courseId: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [orderIndex, setOrderIndex] = useState<number | ''>('');
  const { toast } = useToast();
  const { mutateAsync: createTopic, isPending } = useCreateUpdateTopic();

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
        setTitle('');
        setDescription('');
        setOrderIndex('');
        toast({
          title: 'Thành công!',
          description: `Chủ đề "${title}" đã được tạo thành công`,
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
