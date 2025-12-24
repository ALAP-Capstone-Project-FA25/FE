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
import { useCreateUpdateCategory } from '@/queries/category.query';
import { CreateUpdateCategoryDto } from '@/types/api.types';

export default function Add() {
  const [name, setName] = useState('');
  const { toast } = useToast();
  const { mutateAsync: createCategory, isPending } = useCreateUpdateCategory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData: CreateUpdateCategoryDto = {
      id: 0, // 0 for create new
      name
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
        toast({
          title: 'Thành công!',
          description: `Danh mục "${name}" đã được tạo thành công`,
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
        <CardTitle>Thêm Danh Mục</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên danh mục</Label>
            <Input
              id="name"
              placeholder="Tên danh mục..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Đang tạo...' : 'Thêm Danh Mục'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
