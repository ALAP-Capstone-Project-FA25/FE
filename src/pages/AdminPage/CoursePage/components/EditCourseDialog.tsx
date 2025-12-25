import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useCreateUpdateCourse, useGetCourseById } from '@/queries/course.query';
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
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { CourseType } from '@/types/api.types';

interface EditCourseDialogProps {
  courseId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditCourseDialog({ courseId, isOpen, onClose }: EditCourseDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>(1);
  const [salePrice, setSalePrice] = useState<number | ''>(1);
  const [categoryId, setCategoryId] = useState<string>('');
  const [mentorId, setMentorId] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [courseType, setCourseType] = useState<CourseType>(CourseType.AS_LEVEL);
  const [difficulty, setDifficulty] = useState<number>(1);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutateAsync: createUpdateCourse, isPending } = useCreateUpdateCourse();
  
  // Get course data
  const { data: courseData, isLoading: isLoadingCourse } = useGetCourseById(courseId || 0, {
    enabled: !!courseId && isOpen
  });
  
  // Get mentors and categories
  const { data: mentorsData, isPending: isPendingMentors } =
    useGetUsersByPagingByRole(1, 100, '', USER_ROLE.MENTOR);
  const mentors = mentorsData?.listObjects || [];
  
  const { data: categoriesData, isPending: isPendingCategories } =
    useGetCategoriesByPaging(1, 100, '');
  const categories = categoriesData?.listObjects || [];

  // Reset form when dialog closes or courseId changes
  useEffect(() => {
    if (!isOpen || !courseId) {
      setTitle('');
      setDescription('');
      setPrice(1);
      setSalePrice(1);
      setCategoryId('');
      setMentorId('');
      setImageUrl('');
      setCourseType(CourseType.AS_LEVEL);
      setDifficulty(1);
    }
  }, [isOpen, courseId]);

  // Populate form when course data is loaded
  useEffect(() => {
    if (courseData?.data && isOpen && courseId) {
      const course = courseData.data;
      
      setTitle(course.title || '');
      setDescription(course.description || '');
      setPrice(course.price || 1);
      setSalePrice(course.salePrice || 1);
      setCategoryId(course.categoryId?.toString() || '');
      setMentorId(course.mentorId?.toString() || '');
      setImageUrl(course.imageUrl || '');
      setCourseType((course as any).courseType || CourseType.AS_LEVEL);
      setDifficulty((course as any).difficulty || 1);
    }
  }, [courseData, isOpen, courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseId) return;

    const formData: CreateUpdateCourseDto = {
      id: courseId,
      title,
      description,
      price: price || 1,
      salePrice: salePrice || 1,
      categoryId: parseInt(categoryId) || 0,
      mentorId: parseInt(mentorId) || 0,
      imageUrl: imageUrl || undefined,
      courseType,
      difficulty
    };

    try {
      const [err] = await createUpdateCourse(formData);

      if (err) {
        toast({
          title: 'Lỗi',
          description: err.message || 'Có lỗi xảy ra khi cập nhật khóa học',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Thành công!',
          description: `Khóa học "${title}" đã được cập nhật thành công`,
          variant: 'default'
        });
        
        // Refresh courses list
        queryClient.invalidateQueries({ queryKey: ['courses'] });
        
        // Close dialog
        onClose();
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Có lỗi xảy ra',
        variant: 'destructive'
      });
    }
  };

  const isLoading = isLoadingCourse || isPendingCategories || isPendingMentors;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa khóa học</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="mentorId">Mentor</Label>
                  <Select value={mentorId} onValueChange={setMentorId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn mentor..." />
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="courseType">Loại khóa học</Label>
                  <Select 
                    value={courseType.toString()} 
                    onValueChange={(value) => setCourseType(parseInt(value) as CourseType)} 
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại khóa học..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CourseType.AS_LEVEL.toString()}>AS Level</SelectItem>
                      <SelectItem value={CourseType.A2_LEVEL.toString()}>A2 Level</SelectItem>
                      <SelectItem value={CourseType.BOTH.toString()}>Cả hai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Độ khó (1-5 sao)</Label>
                  <Select 
                    value={difficulty.toString()} 
                    onValueChange={(value) => setDifficulty(parseInt(value))} 
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn độ khó..." />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <SelectItem key={star} value={star.toString()}>
                          {'⭐'.repeat(star)} ({star} sao)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ảnh khóa học</Label>
                <SingleFileUpload
                  key={`course-image-${courseId}-${isOpen}`} // Force re-render when dialog opens
                  onFileUploaded={(url) => setImageUrl(url)}
                  acceptedFileTypes={['image/*']}
                  maxFileSize={5}
                  placeholder="Kéo thả ảnh hoặc click để chọn"
                  autoUpload={true}
                  initialImageUrl={imageUrl}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  'Cập nhật khóa học'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}