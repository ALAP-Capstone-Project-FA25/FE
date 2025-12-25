import { useState } from 'react';
import {  useGetAllActiveEntryTests, useSubmitEntryTest } from '@/queries/entryTest.query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

export default function EntryTestDynamic() {
  const { data: testData, isPending } = useGetAllActiveEntryTests();
  const { mutateAsync: submitTest, isPending: isSubmitting } = useSubmitEntryTest();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
    console.log(testData)
  const test = testData;

  const handleChange = (questionId: number, optionCode: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionCode
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!test) return;

    const allAnswered = test.questions?.every((q) => answers[q.id]);
    if (!allAnswered) {
      toast({
        title: 'Chưa hoàn thành',
        description: 'Vui lòng trả lời tất cả câu hỏi',
        variant: 'destructive'
      });
      return;
    }

    try {
      const [err, response] = await submitTest({
        entryTestId: test.id,
        answers
      });
      
      if (err) {
        toast({
          title: 'Lỗi',
          description: err.message || 'Có lỗi xảy ra',
          variant: 'destructive'
        });
      } else {
        setResult(response);
        toast({
          title: 'Hoàn thành!',
          description: 'Bạn đã hoàn thành bài test',
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

  if (isPending) {
    return (
      <div className="min-h-screen bg-slate-100 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-slate-100 flex justify-center items-center">
        <Card className="p-6">
          <p className="text-center text-slate-600">
            Hiện tại chưa có bài test nào đang hoạt động.
          </p>
        </Card>
      </div>
    );
  }

  const allAnswered = test.questions?.every((q) => answers[q.id]);

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-start py-6 px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          {test.title}
        </h1>
        <p className="text-sm text-slate-500 mt-1 mb-5">{test.description}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {test.questions?.map((q, index) => (
            <div
              key={q.id}
              className="border border-slate-200 rounded-xl bg-slate-50 px-4 py-3"
            >
              <div className="mb-2">
                <span className="inline-flex items-center justify-center text-xs font-semibold text-blue-700 bg-blue-50 rounded-full px-2 py-0.5 mr-2">
                  Câu {index + 1}
                </span>
                <span className="font-semibold text-sm text-slate-800">
                  {q.questionText}
                </span>
              </div>
              <div className="space-y-1">
                {q.options?.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={opt.optionCode}
                      className="mt-0.5 accent-blue-600"
                      checked={answers[q.id] === opt.optionCode}
                      onChange={() => handleChange(q.id, opt.optionCode)}
                    />
                    <span>
                      <span className="font-semibold mr-1">
                        {opt.optionCode}.
                      </span>
                      {opt.optionText}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-2">
            <Button
              type="submit"
              disabled={!allAnswered || isSubmitting}
              className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Xem gợi ý môn học'
              )}
            </Button>
            {!allAnswered && (
              <p className="text-xs text-slate-400 mt-1">
                Vui lòng trả lời tất cả câu hỏi trước khi xem kết quả.
              </p>
            )}
          </div>
        </form>

        {result && (
          <div className="mt-6 border-t border-slate-200 pt-4">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Kết quả gợi ý
            </h2>

            {/* Recommended Subjects */}
            {result.recommendedSubjects &&
              result.recommendedSubjects.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-slate-800 mb-2">
                    Môn học phù hợp
                  </h3>
                  <ul className="space-y-3">
                    {result.recommendedSubjects.map((subject: any) => (
                      <li
                        key={subject.categoryId}
                        className="border border-slate-200 rounded-lg px-3 py-2 bg-slate-50"
                      >
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-semibold text-slate-900">
                            {subject.categoryName}
                          </span>
                          <span className="text-xs text-slate-600">
                            {subject.score} điểm
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {subject.description}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Recommended Majors */}
            {result.recommendedMajors && result.recommendedMajors.length > 0 && (
              <div>
                <h3 className="text-md font-semibold text-slate-800 mb-2">
                  Ngành nghề phù hợp
                </h3>
                <ul className="space-y-3">
                  {result.recommendedMajors.map((major: any) => (
                    <li
                      key={major.majorId}
                      className="border border-blue-200 rounded-lg px-3 py-3 bg-blue-50"
                    >
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="font-semibold text-blue-900">
                          {major.majorName}
                        </span>
                        <span className="text-xs text-blue-600">
                          {major.score} điểm
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">
                        {major.description}
                      </p>
                      {major.relatedSubjects &&
                        major.relatedSubjects.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {major.relatedSubjects.map(
                              (subject: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
                                >
                                  {subject}
                                </span>
                              )
                            )}
                          </div>
                        )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => navigate('/pick-major')}
                variant="default"
              >
                Chọn ngành học
              </Button>
              <Button
                onClick={() => {
                  setAnswers({});
                  setResult(null);
                }}
                variant="outline"
              >
                Làm lại
              </Button>
            </div>

            <p className="text-[11px] text-slate-400 mt-3">
              *Kết quả chỉ mang tính gợi ý dựa trên câu trả lời của bạn, không
              phải kết luận tuyệt đối. Hãy kết hợp thêm trải nghiệm thực tế và ý
              kiến từ giáo viên/gia đình khi chọn môn A-level.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
