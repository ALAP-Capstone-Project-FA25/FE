import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRouter } from '@/routes/hooks';
import {
  useGetBlogPostById,
  useCreateUpdateBlogPost
} from '@/queries/blog.query';
import {
  BlogPostTargetAudience,
  CreateUpdateBlogPostDto,
  BlogPostSectionDto
} from '@/types/api.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Trash2, Loader2, X } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import SingleFileUpload from '@/components/shared/single-file-upload';
import { toast } from '@/components/ui/use-toast';

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ color: [] }, { background: [] }],
    ['link', 'image', 'code-block'],
    ['clean']
  ]
};

export default function BlogCreateEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isEditMode = !!id;
  const { data: postData } = useGetBlogPostById(Number(id));
  const createUpdateMutation = useCreateUpdateBlogPost();

  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [targetAudience, setTargetAudience] = useState<BlogPostTargetAudience>(
    BlogPostTargetAudience.BOTH
  );
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [sections, setSections] = useState<BlogPostSectionDto[]>([]);

  useEffect(() => {
    if (isEditMode && postData?.data) {
      const post = postData.data;
      setTitle(post.title);
      setImageUrl(post.imageUrl || '');
      setTargetAudience(post.targetAudience);
      if (post.tags) {
        try {
          setTags(JSON.parse(post.tags));
        } catch {
          setTags([]);
        }
      }
      if (post.sections) {
        setSections(
          post.sections.map((s) => ({
            id: s.id,
            title: s.title,
            content: s.content,
            orderIndex: s.orderIndex
          }))
        );
      }
    } else {
      // Add initial section for new post
      if (sections.length === 0) {
        setSections([
          {
            id: 0,
            title: '',
            content: '',
            orderIndex: 0
          }
        ]);
      }
    }
  }, [isEditMode, postData]);

  const addSection = () => {
    setSections([
      ...sections,
      {
        id: 0,
        title: '',
        content: '',
        orderIndex: sections.length
      }
    ]);
  };

  const removeSection = (index: number) => {
    if (sections.length > 1) {
      const newSections = sections.filter((_, i) => i !== index);
      // Reorder
      newSections.forEach((s, i) => {
        s.orderIndex = i;
      });
      setSections(newSections);
    }
  };

  const updateSection = (
    index: number,
    field: 'title' | 'content',
    value: string
  ) => {
    const newSections = [...sections];
    newSections[index][field] = value;
    setSections(newSections);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập tiêu đề',
        variant: 'destructive'
      });
      return;
    }

    if (sections.some((s) => !s.title.trim() || !s.content.trim())) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin cho tất cả các section',
        variant: 'destructive'
      });
      return;
    }

    try {
      const dto: CreateUpdateBlogPostDto = {
        id: isEditMode ? Number(id) : 0,
        title,
        imageUrl,
        targetAudience,
        tags,
        sections
      };

      await createUpdateMutation.mutateAsync(dto);
      toast({
        title: 'Thành công',
        description: isEditMode ? 'Đã cập nhật bài viết' : 'Đã tạo bài viết'
      });
      router.push('/blog');
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error?.message || 'Có lỗi xảy ra',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => router.push('/blog')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>

      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold">
          {isEditMode ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}
        </h1>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề bài viết"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Hình ảnh</Label>
              <SingleFileUpload
                onFileUploaded={setImageUrl}
                acceptedFileTypes={['image/*']}
                initialImageUrl={imageUrl}
              />
            </div>

            <div className="space-y-2">
              <Label>Đối tượng *</Label>
              <Select
                value={targetAudience.toString()}
                onValueChange={(value) =>
                  setTargetAudience(parseInt(value) as BlogPostTargetAudience)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value={BlogPostTargetAudience.AS_LEVEL.toString()}
                  >
                    AS Level
                  </SelectItem>
                  <SelectItem
                    value={BlogPostTargetAudience.A2_LEVEL.toString()}
                  >
                    A2 Level
                  </SelectItem>
                  <SelectItem value={BlogPostTargetAudience.BOTH.toString()}>
                    Cả hai
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Nhập tag và nhấn Enter"
                />
                <Button type="button" onClick={addTag}>
                  Thêm
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-2">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sections */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Nội dung bài viết</CardTitle>
              <Button type="button" variant="outline" onClick={addSection}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm section
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {sections.map((section, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Section {index + 1}
                    </CardTitle>
                    {sections.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSection(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tiêu đề section *</Label>
                    <Input
                      value={section.title}
                      onChange={(e) =>
                        updateSection(index, 'title', e.target.value)
                      }
                      placeholder="Nhập tiêu đề section"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nội dung *</Label>
                    <div className="rounded-lg border">
                      <ReactQuill
                        theme="snow"
                        value={section.content}
                        onChange={(value) =>
                          updateSection(index, 'content', value)
                        }
                        modules={quillModules}
                        className="min-h-[300px]"
                        placeholder="Nhập nội dung section..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/blog')}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={createUpdateMutation.isPending}>
            {createUpdateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              'Lưu bài viết'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
