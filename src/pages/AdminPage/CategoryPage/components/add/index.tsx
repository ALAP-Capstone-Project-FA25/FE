'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useCreateUpdateCategory } from '@/queries/category.query';
import { CreateUpdateCategoryDto } from '@/types/api.types';
import { useGetListMajorByPaging } from '@/queries/major.query';
import SingleFileUpload from '@/components/shared/single-file-upload';

export default function Add() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [majorId, setMajorId] = useState<string>('');
  const { toast } = useToast();
  const { mutateAsync: createCategory, isPending } = useCreateUpdateCategory();
  const { data: majorsData, isPending: isLoadingMajors } =
    useGetListMajorByPaging(1, 100, '');

  const majors = majorsData?.listObjects || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!majorId) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn chuyên ngành',
        variant: 'destructive'
      });
      return;
    }

    if (!imageUrl) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng upload ảnh minh họa',
        variant: 'destructive'
      });
      return;
    }

    const formData: CreateUpdateCategoryDto = {
      id: 0,
      name,
      description,
      imageUrl,
      majorId: Number(majorId)
    };

    try {
      const [err] = await createCategory(formData);

      if (err) {
        toast({
          title: 'Lỗi',
          description: err.message || 'Có lỗi xảy ra',
          variant: 'destructive'
        });
      } else {
        setName('');
        setDescription('');
        setImageUrl('');
        setMajorId('');
        toast({
          title: 'Thành công!',
          description: `Môn học "${name}" đã được tạo thành công`,
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
        <CardTitle>Thêm môn học</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên môn học</Label>
            <Input
              id="name"
              placeholder="Tên môn học..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Mô tả môn học..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Ảnh minh họa</Label>
            <SingleFileUpload
              onFileUploaded={(url) => setImageUrl(url)}
              acceptedFileTypes={['image/*']}
              maxFileSize={5}
              placeholder="Kéo thả ảnh hoặc click để chọn"
              autoUpload={true}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="major">Chuyên ngành</Label>
            <Select value={majorId} onValueChange={setMajorId} required>
              <SelectTrigger>
                <SelectValue placeholder="Chọn chuyên ngành..." />
              </SelectTrigger>
              <SelectContent>
                {isLoadingMajors ? (
                  <SelectItem value="loading" disabled>
                    Đang tải...
                  </SelectItem>
                ) : majors.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    Chưa có chuyên ngành
                  </SelectItem>
                ) : (
                  majors.map((major) => (
                    <SelectItem key={major.id} value={major.id.toString()}>
                      {major.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Đang tạo...' : 'Thêm môn học'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
