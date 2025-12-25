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
import { useCreateUpdateCourse } from '@/queries/course.query';
import { useGetCategoriesByPaging } from '@/queries/category.query';
import { CreateUpdateCourseDto } from '@/types/api.types';
import SingleFileUpload from '@/components/shared/single-file-upload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useGetUsersByPagingByRole } from '@/queries/user.query';
import { USER_ROLE } from '@/constants/data';

export default function Add() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>(1); // Giá mặc định 1 đồng
  const [salePrice, setSalePrice] = useState<number | ''>(1); // Giá khuyến mãi mặc định 1 đồng
  const [categoryId, setCategoryId] = useState<string>('');
  const [mentorId, setMentorId] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const { toast } = useToast();
  const { mutateAsync: createCourse, isPending } = useCreateUpdateCourse();
  const { data: mentorsData, isPending: isPendingMentors } =
    useGetUsersByPagingByRole(1, 100, '', USER_ROLE.MENTOR);
  const mentors = mentorsData?.listObjects || [];
  // Get categories for dropdown
  const { data: categoriesData, isPending: isPendingCategories } =
    useGetCategoriesByPaging(1, 100, '');
  const categories = categoriesData?.listObjects || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData: CreateUpdateCourseDto = {
      id: 0, // 0 for create new
      title,
      description,
      price: price || 1,
      salePrice: salePrice || 1,
      categoryId: parseInt(categoryId) || 0,
      mentorId: parseInt(mentorId) || 0,
      imageUrl: imageUrl || undefined
    };

    try {
      const [err] = await createCourse(formData);

      if (err) {
        toast({
          title: 'Lỗi',
          description: err.message || 'Có lỗi xảy ra',
          variant: 'destructive'
        });
      } else {
        setTitle('');
        setDescription('');
        setPrice(1);
        setSalePrice(1);
        setCategoryId('');
        setImageUrl('');
        toast({
          title: 'Thành công!',
          description: `Khóa học "${title}" đã được tạo thành công`,
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
  if (isPendingCategories || isPendingMentors) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Thêm Khóa Học</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề khóa học</Label>
            <Input
              id="title"
              placeholder="Tiêu đề khóa học..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Input
              id="description"
              placeholder="Mô tả khóa học..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Ẩn phần giá - đặt giá mặc định là 1 đồng */}
          <div className="hidden space-y-2">
            <Label htmlFor="price">Giá gốc (vnđ)</Label>
            <Input
              id="price"
              type="number"
              placeholder="Giá gốc (vnđ)..."
              value={price}
              onChange={(e) =>
                setPrice(e.target.value ? parseInt(e.target.value, 10) : '')
              }
              required
            />
          </div>

          <div className="hidden space-y-2">
            <Label htmlFor="salePrice">Giá khuyến mãi (vnđ)</Label>
            <Input
              id="salePrice"
              type="number"
              placeholder="Giá khuyến mãi (vnđ)..."
              value={salePrice}
              onChange={(e) =>
                setSalePrice(e.target.value ? parseInt(e.target.value, 10) : '')
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Danh mục</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Mentor</Label>
            <Select value={mentorId} onValueChange={setMentorId} required>
              <SelectTrigger>
                <SelectValue placeholder="Chọn mentor phụ trách khóa học..." />
              </SelectTrigger>
              <SelectContent>
                {mentors.map((mentor: any) => (
                  <SelectItem key={mentor.id} value={mentor.id.toString()}>
                    {mentor.firstName} {mentor.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ảnh khóa học</Label>
            <SingleFileUpload
              onFileUploaded={(url) => setImageUrl(url)}
              acceptedFileTypes={['image/*']}
              maxFileSize={5}
              placeholder="Kéo thả ảnh hoặc click để chọn"
              autoUpload={true}
            />
            {imageUrl && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Ảnh đã chọn:</p>
                <img
                  src={imageUrl}
                  alt="Course preview"
                  className="mt-1 h-20 w-20 rounded object-cover"
                />
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Đang tạo...' : 'Thêm Khóa Học'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
