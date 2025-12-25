import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useCreateUpdateEntryTest } from '@/queries/entryTest.query';
import { useGetListCategoryByPaging } from '@/queries/category.query';
import {
  CreateUpdateEntryTestDto,
  CreateUpdateEntryTestQuestionDto,
} from '@/types/api.types';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function Add() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [questions, setQuestions] = useState<CreateUpdateEntryTestQuestionDto[]>([]);
  
  const { toast } = useToast();
  const { mutateAsync: createEntryTest, isPending } = useCreateUpdateEntryTest();
  const { data: categoriesData } = useGetListCategoryByPaging(1, 100, '');
  
  const categories = categoriesData?.listObjects || [];

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: 0,
        questionText: '',
        displayOrder: questions.length + 1,
        options: []
      }
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    const optionCode = String.fromCharCode(65 + updated[questionIndex].options.length);
    updated[questionIndex].options.push({
      id: 0,
      optionCode,
      optionText: '',
      displayOrder: updated[questionIndex].options.length + 1,
      categoryIds: [],
      weight: 1
    });
    setQuestions(updated);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].options = updated[questionIndex].options.filter(
      (_, i) => i !== optionIndex
    );
    setQuestions(updated);
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    field: string,
    value: any
  ) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = {
      ...updated[questionIndex].options[optionIndex],
      [field]: value
    };
    setQuestions(updated);
  };

  const toggleCategory = (
    questionIndex: number,
    optionIndex: number,
    categoryId: number
  ) => {
    const updated = [...questions];
    const option = updated[questionIndex].options[optionIndex];
    const categoryIds = option.categoryIds || [];
    
    if (categoryIds.includes(categoryId)) {
      option.categoryIds = categoryIds.filter((id) => id !== categoryId);
    } else {
      option.categoryIds = [...categoryIds, categoryId];
    }
    
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (questions.length === 0) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng thêm ít nhất 1 câu hỏi',
        variant: 'destructive'
      });
      return;
    }

    const formData: CreateUpdateEntryTestDto = {
      id: 0,
      title,
      description,
      isActive,
      displayOrder: 0, // Auto set by backend
      questions
    };

    try {
      const [err] = await createEntryTest(formData);
      
      if (err) {
        toast({
          title: 'Lỗi',
          description: err.message || 'Có lỗi xảy ra',
          variant: 'destructive'
        });
      } else {
        setTitle('');
        setDescription('');
        setIsActive(true);
        setQuestions([]);
        
        toast({
          title: 'Thành công!',
          description: 'Bài test đã được tạo thành công',
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
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Thêm bài test đầu vào</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề bài test</Label>
            <Input
              id="title"
              placeholder="Tiêu đề..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Mô tả bài test..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="isActive">Kích hoạt</Label>
            </div>
            
            <p className="text-sm text-slate-500">
              (Thứ tự hiển thị sẽ được tự động thiết lập)
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Câu hỏi</Label>
              <Button type="button" onClick={addQuestion} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Thêm câu hỏi
              </Button>
            </div>

            {questions.map((question, qIndex) => (
              <Card key={qIndex} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <Label>Câu {qIndex + 1}</Label>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeQuestion(qIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <Textarea
                    placeholder="Nội dung câu hỏi..."
                    value={question.questionText}
                    onChange={(e) =>
                      updateQuestion(qIndex, 'questionText', e.target.value)
                    }
                    rows={2}
                  />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Các đáp án</Label>
                      <Button
                        type="button"
                        onClick={() => addOption(qIndex)}
                        size="sm"
                        variant="outline"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm đáp án
                      </Button>
                    </div>

                    {question.options.map((option, oIndex) => (
                      <Card key={oIndex} className="p-3 bg-slate-50">
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <span className="font-semibold text-sm mt-2">
                              {option.optionCode}.
                            </span>
                            <Input
                              placeholder="Nội dung đáp án..."
                              value={option.optionText}
                              onChange={(e) =>
                                updateOption(
                                  qIndex,
                                  oIndex,
                                  'optionText',
                                  e.target.value
                                )
                              }
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(qIndex, oIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">
                              Môn học liên quan:
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                              {categories.map((cat) => (
                                <div
                                  key={cat.id}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`cat-${qIndex}-${oIndex}-${cat.id}`}
                                    checked={option.categoryIds?.includes(
                                      cat.id
                                    )}
                                    onCheckedChange={() =>
                                      toggleCategory(qIndex, oIndex, cat.id)
                                    }
                                  />
                                  <label
                                    htmlFor={`cat-${qIndex}-${oIndex}-${cat.id}`}
                                    className="text-xs cursor-pointer"
                                  >
                                    {cat.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Đang tạo...' : 'Tạo bài test'}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
