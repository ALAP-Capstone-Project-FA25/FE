import { useEffect, useState } from 'react';
import { Plus, Trash2, Check, X, Edit } from 'lucide-react';
import ExcelImportDialog from './ExcelImportDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useCreateUpdateTopicQuestion,
  useGetTopicQuestionsByPaging
} from '@/queries/topic-question.query';
import { useParams } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useGetCoursesByPaging } from '@/queries/course.query';
import { useGetTopicsByCourseId } from '@/queries/topic.query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export default function ExamManagement() {
  const { topicId } = useParams();
  const { data: topicQuestions, refetch } = useGetTopicQuestionsByPaging(
    1,
    100,
    '',
    Number(topicId)
  );
  const [questions, setQuestions] = useState(topicQuestions?.listObjects || []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState({
    id: 0,
    question: '',
    maxChoices: 1,
    referrerLessonId: undefined as number | undefined,
    answers: [
      { id: 0, answer: '', isCorrect: false },
      { id: 0, answer: '', isCorrect: false }
    ]
  });
  const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>(
    undefined
  );
  const { mutateAsync: createUpdateTopicQuestion } =
    useCreateUpdateTopicQuestion();

  // Get all courses
  const { data: coursesData } = useGetCoursesByPaging(1, 1000, '');
  const courses = coursesData?.listObjects || [];

  // Get topics from selected course
  const { data: topicsData } = useGetTopicsByCourseId(selectedCourseId || 0);
  const topics = topicsData?.listObjects || [];

  // Get all lessons from all topics of selected course
  const [allLessons, setAllLessons] = useState<any[]>([]);

  useEffect(() => {
    if (topics.length > 0 && selectedCourseId) {
      console.log('Fetching lessons for topics:', topics);
      const fetchLessons = async () => {
        try {
          const BaseRequest = (await import('@/config/axios.config')).default;
          const lessonPromises = topics.map(async (topic: any) => {
            try {
              const response = await BaseRequest.Get(
                `/api/Lesson/get-by-paging?pageNumber=1&pageSize=1000&topicId=${topic.id}`
              );
              console.log(`Response for topic ${topic.id}:`, response);
              // Response structure: { statusCode, success, data: { listObjects: [...] } }
              const lessons = response?.listObjects || [];
              console.log(`Lessons for topic ${topic.id}:`, lessons);
              return lessons;
            } catch (error) {
              console.error(
                `Error fetching lessons for topic ${topic.id}:`,
                error
              );
              return [];
            }
          });
          const lessonsArrays = await Promise.all(lessonPromises);
          const flattened = lessonsArrays.flat();
          console.log('All fetched lessons (flattened):', flattened);
          setAllLessons(flattened);
        } catch (error) {
          console.error('Error fetching lessons:', error);
          setAllLessons([]);
        }
      };
      fetchLessons();
    } else {
      setAllLessons([]);
    }
  }, [topics, selectedCourseId]);

  useEffect(() => {
    setQuestions(topicQuestions?.listObjects || []);
  }, [topicQuestions]);

  const resetForm = () => {
    setCurrentQuestion({
      id: 0,
      question: '',
      maxChoices: 1,
      referrerLessonId: undefined,
      answers: [
        { id: 0, answer: '', isCorrect: false },
        { id: 0, answer: '', isCorrect: false }
      ]
    });
    setSelectedCourseId(undefined);
    setEditingQuestion(null);
  };

  const handleEdit = async (question) => {
    setEditingQuestion(question);
    setCurrentQuestion({
      id: question.id,
      question: question.question,
      maxChoices: question.maxChoices,
      referrerLessonId: question.referrerLessonId,
      answers: question.topicQuestionAnswers.map((a) => ({
        id: a.id,
        answer: a.answer,
        isCorrect: a.isCorrect
      }))
    });

    // If there's a referrerLessonId, fetch the lesson to get courseId
    if (question.referrerLessonId) {
      try {
        const BaseRequest = (await import('@/config/axios.config')).default;
        const response = await BaseRequest.Get(
          `/api/Lesson/${question.referrerLessonId}`
        );
        // Response structure: { statusCode, success, data: { topic: { courseId: ... } } }
        if (response?.data?.topic?.courseId) {
          setSelectedCourseId(response.data.topic.courseId);
        }
      } catch (error) {
        console.error('Error fetching lesson:', error);
      }
    }

    setIsDialogOpen(true);
  };

  const handleDelete = (question) => {
    setQuestionToDelete(question);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!questionToDelete) return;

    try {
      const BaseRequest = (await import('@/config/axios.config')).default;
      const [err] = await BaseRequest.Delete(
        `/api/TopicQuestion/delete/${questionToDelete.id}`
      );

      if (err) {
        toast({
          title: 'Lỗi',
          description: err.message || 'Có lỗi xảy ra khi xóa câu hỏi',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Thành công!',
          description: 'Câu hỏi đã được xóa thành công',
          variant: 'default'
        });
        refetch();
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra khi xóa câu hỏi',
        variant: 'destructive'
      });
    }

    setDeleteDialogOpen(false);
    setQuestionToDelete(null);
  };

  const handleAnswerChange = (index, field, value) => {
    const newAnswers = [...currentQuestion.answers];
    newAnswers[index][field] = value;
    setCurrentQuestion({ ...currentQuestion, answers: newAnswers });
  };

  const addAnswer = () => {
    setCurrentQuestion({
      ...currentQuestion,
      answers: [
        ...currentQuestion.answers,
        { id: 0, answer: '', isCorrect: false }
      ]
    });
  };

  const removeAnswer = (index) => {
    if (currentQuestion.answers.length > 2) {
      const newAnswers = currentQuestion.answers.filter((_, i) => i !== index);
      setCurrentQuestion({ ...currentQuestion, answers: newAnswers });
    }
  };

  const handleSubmit = async () => {
    const correctAnswersCount = currentQuestion.answers.filter(
      (a) => a.isCorrect
    ).length;

    if (!currentQuestion.question.trim()) {
      alert('Vui lòng nhập câu hỏi');
      return;
    }

    if (currentQuestion.answers.some((a) => !a.answer.trim())) {
      alert('Vui lòng điền đầy đủ các đáp án');
      return;
    }

    if (correctAnswersCount === 0) {
      alert('Phải có ít nhất một đáp án đúng');
      return;
    }

    if (correctAnswersCount > currentQuestion.maxChoices) {
      alert(
        `Số đáp án đúng (${correctAnswersCount}) vượt quá số lựa chọn tối đa (${currentQuestion.maxChoices})`
      );
      return;
    }

    const payload = {
      id: currentQuestion.id,
      topicId: Number(topicId),
      maxChoices: currentQuestion.maxChoices,
      question: currentQuestion.question,
      referrerLessonId: currentQuestion.referrerLessonId || null,
      answers: currentQuestion.answers.map((a) => ({
        id: a.id,
        answer: a.answer,
        isCorrect: a.isCorrect
      }))
    };

    try {
      const [err] = await createUpdateTopicQuestion(payload);
      if (err) {
        toast({
          title: 'Lỗi',
          description: err.message || 'Có lỗi xảy ra',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Thành công!',
          description: editingQuestion
            ? 'Câu hỏi đã được cập nhật thành công'
            : 'Câu hỏi đã được tạo thành công',
          variant: 'default'
        });
        refetch();
        resetForm();
        setIsDialogOpen(false);
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra khi lưu câu hỏi',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Quản Lý Câu Hỏi
            </h1>
            <p className="mt-1 text-slate-600">
              Tổng số: {questions.length} câu hỏi
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ExcelImportDialog onImportSuccess={refetch} />

            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  resetForm();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2" onClick={resetForm}>
                  <Plus size={20} />
                  Thêm Câu Hỏi
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingQuestion ? 'Chỉnh Sửa Câu Hỏi' : 'Tạo Câu Hỏi Mới'}
                  </DialogTitle>
                  <DialogDescription>
                    Điền thông tin câu hỏi và các đáp án bên dưới
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="question">
                      Câu hỏi <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="question"
                      value={currentQuestion.question}
                      onChange={(e) =>
                        setCurrentQuestion({
                          ...currentQuestion,
                          question: e.target.value
                        })
                      }
                      placeholder="Nhập câu hỏi..."
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxChoices">Số lựa chọn tối đa</Label>
                      <Input
                        id="maxChoices"
                        type="number"
                        min="1"
                        max={currentQuestion.answers.length}
                        value={currentQuestion.maxChoices}
                        onChange={(e) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            maxChoices: parseInt(e.target.value) || 1
                          })
                        }
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="referrerLessonId">
                        Bài học gợi ý (tùy chọn)
                      </Label>
                      <div className="space-y-3">
                        <Select
                          value={selectedCourseId?.toString() || undefined}
                          onValueChange={(value) => {
                            const courseId =
                              value && value !== 'none'
                                ? parseInt(value)
                                : undefined;
                            setSelectedCourseId(courseId);
                            // Reset lesson selection when course changes
                            setCurrentQuestion({
                              ...currentQuestion,
                              referrerLessonId: undefined
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn khóa học..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Không chọn</SelectItem>
                            {courses.map((course: any) => (
                              <SelectItem
                                key={course.id}
                                value={course.id.toString()}
                              >
                                {course.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {selectedCourseId && (
                          <Select
                            value={
                              currentQuestion.referrerLessonId?.toString() ||
                              undefined
                            }
                            onValueChange={(value) =>
                              setCurrentQuestion({
                                ...currentQuestion,
                                referrerLessonId:
                                  value && value !== 'none'
                                    ? parseInt(value)
                                    : undefined
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn bài học..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Không chọn</SelectItem>
                              {allLessons.map((lesson: any) => (
                                <SelectItem
                                  key={lesson.id}
                                  value={lesson.id.toString()}
                                >
                                  {lesson.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>
                        Đáp án <span className="text-red-500">*</span>
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addAnswer}
                        className="flex items-center gap-1"
                      >
                        <Plus size={16} />
                        Thêm đáp án
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {currentQuestion.answers.map((answer, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleAnswerChange(
                                index,
                                'isCorrect',
                                !answer.isCorrect
                              )
                            }
                            className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border-2 transition ${
                              answer.isCorrect
                                ? 'border-green-500 bg-green-500'
                                : 'border-slate-300 hover:border-slate-400'
                            }`}
                          >
                            {answer.isCorrect && (
                              <Check size={16} className="text-white" />
                            )}
                          </button>

                          <Input
                            value={answer.answer}
                            onChange={(e) =>
                              handleAnswerChange(
                                index,
                                'answer',
                                e.target.value
                              )
                            }
                            placeholder={`Đáp án ${index + 1}`}
                            className="flex-1"
                          />

                          {currentQuestion.answers.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeAnswer(index)}
                              className="flex-shrink-0 text-red-500 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 size={20} />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        resetForm();
                      }}
                    >
                      Hủy
                    </Button>
                    <Button onClick={handleSubmit}>
                      {editingQuestion ? 'Cập nhật' : 'Lưu Câu Hỏi'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Questions List */}
        <div className="grid gap-4">
          {questions.map((q, qIndex) => (
            <Card key={q.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Câu {qIndex + 1}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Chọn tối đa: {q.maxChoices}
                      </Badge>
                      {q.referrerLessonId && (
                        <Badge
                          variant="outline"
                          className="border-blue-500 text-xs text-blue-700"
                        >
                          Có bài học gợi ý
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg font-semibold text-slate-900">
                      {q.question}
                    </CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(q)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleDelete(q)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {q.topicQuestionAnswers.map((answer) => (
                    <div
                      key={answer.id}
                      className={`flex items-start gap-3 rounded-lg border p-3 transition ${
                        answer.isCorrect
                          ? 'border-green-200 bg-green-50'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {answer.isCorrect ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                            <Check size={14} className="text-white" />
                          </div>
                        ) : (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-300">
                            <X size={14} className="text-white" />
                          </div>
                        )}
                      </div>
                      <span
                        className={`text-sm ${answer.isCorrect ? 'font-medium text-green-900' : 'text-slate-700'}`}
                      >
                        {answer.answer}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa câu hỏi</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa câu hỏi này không? Hành động này không
                thể hoàn tác.
                <br />
                <br />
                <strong>Câu hỏi:</strong> {questionToDelete?.question}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
