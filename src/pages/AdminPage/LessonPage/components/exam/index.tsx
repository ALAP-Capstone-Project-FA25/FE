import { useEffect, useState } from 'react';
import { Plus, Trash2, Check, X, Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
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

export default function ExamManagement() {
  const { topicId } = useParams();
  console.log(topicId);
  const { data: topicQuestions } = useGetTopicQuestionsByPaging(
    1,
    10,
    '',
    Number(topicId)
  );
  const [questions, setQuestions] = useState(topicQuestions?.listObjects || []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    maxChoices: 1,
    answers: [
      { answer: '', isCorrect: false },
      { answer: '', isCorrect: false },
      { answer: '', isCorrect: false },
      { answer: '', isCorrect: false }
    ]
  });
  const { mutateAsync: createUpdateTopicQuestion } =
    useCreateUpdateTopicQuestion();
  useEffect(() => {
    setQuestions(topicQuestions?.listObjects || []);
  }, [topicQuestions]);

  const handleAnswerChange = (index, field, value) => {
    const newAnswers = [...currentQuestion.answers];
    newAnswers[index][field] = value;
    setCurrentQuestion({ ...currentQuestion, answers: newAnswers });
  };

  const addAnswer = async () => {
    setCurrentQuestion({
      ...currentQuestion,
      answers: [...currentQuestion.answers, { answer: '', isCorrect: false }]
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
      id: 0,
      topicId: Number(topicId),
      maxChoices: currentQuestion.maxChoices,
      question: currentQuestion.question,
      answers: currentQuestion.answers.map((a) => ({
        id: 0,
        answer: a.answer,
        isCorrect: a.isCorrect
      }))
    };

    console.log('Payload:', JSON.stringify(payload, null, 2));

    // Simulate adding to list
    const newQuestion = {
      id: questions.length + 1,
      topicId: Number(topicId),
      question: currentQuestion.question,
      maxChoices: currentQuestion.maxChoices,
      topicQuestionAnswers: currentQuestion.answers.map((a, i) => ({
        ...a,
        id: questions.length * 10 + i,
        topicQuestionId: questions.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: '0001-01-01T00:00:00'
      })),
      createdAt: new Date().toISOString(),
      updatedAt: '0001-01-01T00:00:00'
    };
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
        description: 'Câu hỏi đã được tạo thành công',
        variant: 'default'
      });
    }

    setQuestions([...questions, newQuestion]);

    // Reset form
    setCurrentQuestion({
      question: '',
      maxChoices: 1,
      answers: [
        { answer: '', isCorrect: false },
        { answer: '', isCorrect: false },
        { answer: '', isCorrect: false },
        { answer: '', isCorrect: false }
      ]
    });
    setIsDialogOpen(false);
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

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={20} />
                Thêm Câu Hỏi
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tạo Câu Hỏi Mới</DialogTitle>
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
                    className="w-32"
                  />
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
                            handleAnswerChange(index, 'answer', e.target.value)
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
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button onClick={handleSubmit}>Lưu Câu Hỏi</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
                    </div>
                    <CardTitle className="text-lg font-semibold text-slate-900">
                      {q.question}
                    </CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
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
      </div>
    </div>
  );
}
