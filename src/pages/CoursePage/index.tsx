'use client';

import { useState } from 'react';
import {
  useGetCoursesByPaging,
  useCreateUpdateCourse,
  useDeleteCourse
} from '@/queries/course.query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export default function CoursePage() {
  const [pagingModel, setPagingModel] = useState({
    page: 1,
    pageSize: 10,
    keyword: ''
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);

  const {
    data: coursesData,
    isLoading,
    refetch
  } = useGetCoursesByPaging(pagingModel);
  const { mutateAsync: createUpdateCourse, isPending: isCreating } =
    useCreateUpdateCourse();
  const { mutateAsync: deleteCourse, isPending: isDeleting } =
    useDeleteCourse();

  const handleSearch = (keyword: string) => {
    setPagingModel((prev) => ({ ...prev, keyword, page: 1 }));
  };

  const handleCreateUpdate = async (formData: any) => {
    try {
      await createUpdateCourse(formData);
      setIsCreateDialogOpen(false);
      setEditingCourse(null);
      refetch();
    } catch (error) {
      console.error('Error creating/updating course:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa khóa học này?')) {
      try {
        await deleteCourse(id);
        refetch();
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const handleEdit = (course: any) => {
    setEditingCourse(course);
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quản lý Khóa học</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCourse(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm khóa học
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingCourse ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}
              </DialogTitle>
              <DialogDescription>
                {editingCourse
                  ? 'Cập nhật thông tin khóa học'
                  : 'Nhập thông tin khóa học mới'}
              </DialogDescription>
            </DialogHeader>
            <CourseForm
              course={editingCourse}
              onSubmit={handleCreateUpdate}
              isLoading={isCreating}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm khóa học..."
            value={pagingModel.keyword}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Courses List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div>Đang tải...</div>
        ) : coursesData?.data?.items?.length > 0 ? (
          coursesData.data.items.map((course: any) => (
            <Card key={course.id} className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Giá gốc:
                    </span>
                    <span className="font-medium">
                      {course.price?.toLocaleString()} VNĐ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Giá sale:
                    </span>
                    <span className="font-medium text-green-600">
                      {course.salePrice?.toLocaleString()} VNĐ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Học viên:
                    </span>
                    <Badge variant="secondary">{course.members || 0}</Badge>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(course)}
                  >
                    <Edit className="mr-1 h-4 w-4" />
                    Sửa
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(course.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Xóa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-8 text-center text-muted-foreground">
            Không có khóa học nào
          </div>
        )}
      </div>
    </div>
  );
}

// Course Form Component
function CourseForm({ course, onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    id: course?.id || 0,
    title: course?.title || '',
    description: course?.description || '',
    price: course?.price || 0,
    salePrice: course?.salePrice || 0,
    categoryId: course?.categoryId || 1
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Tên khóa học</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Giá gốc (VNĐ)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                price: parseInt(e.target.value) || 0
              }))
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="salePrice">Giá sale (VNĐ)</Label>
          <Input
            id="salePrice"
            type="number"
            value={formData.salePrice}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                salePrice: parseInt(e.target.value) || 0
              }))
            }
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">Danh mục</Label>
        <Select
          value={formData.categoryId.toString()}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, categoryId: parseInt(value) }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Lập trình</SelectItem>
            <SelectItem value="2">Thiết kế</SelectItem>
            <SelectItem value="3">Marketing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Đang xử lý...' : course ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </DialogFooter>
    </form>
  );
}
