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
import { useToast } from '@/components/ui/use-toast';
import { useCreateUpdateMajor } from '@/queries/major.query';
import { CreateUpdateMajorDto } from '@/types/api.types';

export default function Add() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();
  const { mutateAsync: createMajor, isPending } = useCreateUpdateMajor();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData: CreateUpdateMajorDto = {
      id: 0,
      name,
      description
    };

    try {
      const [err] = await createMajor(formData);

      if (err) {
        toast({
          title: 'Lỗi',
          description: err.message || 'Có lỗi xảy ra',
          variant: 'destructive'
        });
      } else {
        setName('');
        setDescription('');
        toast({
          title: 'Thành công!',
          description: `Chuyên ngành "${name}" đã được tạo thành công`,
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
        <CardTitle>Thêm chuyên ngành</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên chuyên ngành</Label>
            <Input
              id="name"
              placeholder="Tên chuyên ngành..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Mô tả chuyên ngành..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Đang tạo...' : 'Thêm chuyên ngành'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
