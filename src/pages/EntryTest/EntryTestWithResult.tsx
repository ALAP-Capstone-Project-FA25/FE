import { useState, useEffect } from 'react';
import {
  useGetEntryTestById,
  useSubmitEntryTest,
  useGetUserTestResult
} from '@/queries/entryTest.query';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BookOpen,
  Trophy,
  Target,
  Star,
  Award,
  Zap,
  GraduationCap,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

type NormalizedSubject = {
  categoryId: number;
  categoryName: string;
  description: string;
  imageUrl?: string;
  score: number;
};

type NormalizedMajor = {
  majorId: number;
  majorName: string;
  description: string;
  score: number;
  relatedSubjects: string[];
};

type NormalizedResult = {
  recommendedSubjects: NormalizedSubject[];
  recommendedMajors: NormalizedMajor[];
};

function normalizeResult(raw: any): NormalizedResult {
  const rawSubjects = raw?.recommendedSubjects || raw?.RecommendedSubjects || [];
  const rawMajors = raw?.recommendedMajors || raw?.RecommendedMajors || [];

  const recommendedSubjects: NormalizedSubject[] = rawSubjects.map((s: any) => ({
    categoryId: s.categoryId ?? s.CategoryId,
    categoryName: s.categoryName ?? s.CategoryName,
    description: s.description ?? s.Description,
    imageUrl: s.imageUrl ?? s.ImageUrl,
    score: s.score ?? s.Score
  }));

  const recommendedMajors: NormalizedMajor[] = rawMajors.map((m: any) => ({
    majorId: m.majorId ?? m.MajorId,
    majorName: m.majorName ?? m.MajorName,
    description: m.description ?? m.Description,
    score: m.score ?? m.Score,
    relatedSubjects: m.relatedSubjects ?? m.RelatedSubjects ?? []
  }));

  return {
    recommendedSubjects,
    recommendedMajors
  };
}

export default function EntryTestWithResult() {
  const { id } = useParams<{ id: string }>();
  const testId = Number(id);

  const { data: testData, isPending: testLoading } = useGetEntryTestById(testId);
  const { data: resultData, isPending: resultLoading } = useGetUserTestResult(testId);
  const { mutateAsync: submitTest, isPending: isSubmitting } = useSubmitEntryTest();

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [currentResult, setCurrentResult] = useState<NormalizedResult | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  const { toast } = useToast();
  const navigate = useNavigate();

  const test = testData;
  const previousResult = resultData;

  useEffect(() => {
    if (previousResult) {
      setShowResult(true);
      try {
        const answersJson = JSON.parse(previousResult.answersJson || '{}');
        const recommendedSubjectsJson = JSON.parse(previousResult.recommendedSubjectsJson || '[]');
        const recommendedMajorsJson = JSON.parse(previousResult.recommendedMajorsJson || '[]');

        const normalized = normalizeResult({
          recommendedSubjects: recommendedSubjectsJson,
          recommendedMajors: recommendedMajorsJson
        });

        setAnswers(answersJson);
        setCurrentResult(normalized);
      } catch (error) {
        console.error('Error parsing previous result:', error);
      }
    }
  }, [previousResult]);

  const handleChange = (questionId: number, optionCode: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionCode
    }));
  };

  const handleRetake = () => {
    setAnswers({});
    setShowResult(false);
    setCurrentResult(null);
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
        const normalized = normalizeResult(response);
        setCurrentResult(normalized);
        setShowResult(true);
        setShowConfetti(true);
        
        setTimeout(() => {
          setShowConfetti(false);
        }, 4000);

        toast({
          title: 'Hoàn thành!',
          description: 'Bạn đã hoàn thành bài test',
          variant: 'success'
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

  if (testLoading || resultLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] flex justify-center items-center">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-4 shadow-2xl">
              <Loader2 className="h-12 w-12 animate-spin text-white" />
            </div>
          </div>
          <p className="text-lg text-gray-400">Đang tải bài test...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] flex justify-center items-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm text-center"
        >
          <div className="mb-6 flex justify-center">
            <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-4 shadow-2xl">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">Không tìm thấy bài test</h2>
          <p className="mb-6 text-gray-400">Vui lòng quay lại danh sách và chọn bài test khác</p>
          <Button
            onClick={() => navigate('/entry-test-list')}
            className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 font-semibold text-white shadow-lg hover:from-orange-600 hover:to-orange-700"
          >
            Quay lại danh sách
          </Button>
        </motion.div>
      </div>
    );
  }

  const allAnswered = test.questions?.every((q) => answers[q.id]);
  const progress = test.questions
    ? (Object.keys(answers).length / test.questions.length) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A]">
      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute h-[800px] w-[800px] rounded-full bg-orange-500/10 blur-3xl"
          style={{ top: '-20%', left: '-10%' }}
        />
        <div
          className="absolute h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-3xl"
          style={{ bottom: '-15%', right: '-10%' }}
        />
      </div>

      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <div className="pointer-events-none fixed inset-0" style={{ zIndex: 9999 }}>
            <Confetti
              width={width}
              height={height}
              recycle={false}
              numberOfPieces={400}
              gravity={0.3}
              colors={['#F97316', '#EA580C', '#C2410C', '#FFFFFF', '#3B82F6', '#60A5FA']}
            />
          </div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex min-h-screen justify-center px-4 py-8">
        <div className="w-full max-w-5xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 shadow-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-white md:text-3xl">{test.title}</h1>
                </div>
                <p className="text-sm text-gray-400">{test.description}</p>
              </div>
              {previousResult && !showResult && (
                <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                  Đã làm trước đó
                </Badge>
              )}
            </div>

            {/* Progress Bar */}
            {!showResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
              >
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-gray-400">Tiến độ hoàn thành</span>
                  <span className="font-semibold text-orange-400">{Math.round(progress)}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>

          {showResult && currentResult ? (
            // ========== RESULT VIEW ==========
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Result Header */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-3 shadow-lg">
                      <Trophy className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Kết quả của bạn</h2>
                      <p className="text-sm text-gray-400">
                        Dựa trên câu trả lời, đây là các gợi ý phù hợp nhất
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleRetake}
                    className="gap-2 rounded-xl border-2 border-white/20 bg-white/10 px-4 py-2 font-semibold text-white backdrop-blur-sm hover:bg-white/20"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Làm lại
                  </Button>
                </div>
              </div>

              {/* Recommended Subjects */}
              {currentResult.recommendedSubjects && currentResult.recommendedSubjects.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 shadow-lg">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Môn học phù hợp</h3>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {currentResult.recommendedSubjects.map((subject, index) => (
                      <motion.div
                        key={subject.categoryId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative overflow-hidden rounded-xl border-2 border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-blue-500/50 hover:bg-white/10"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                        <div className="relative">
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Star className="h-5 w-5 text-blue-400" />
                              <h4 className="font-bold text-white">{subject.categoryName}</h4>
                            </div>
                            <div className="flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1">
                              <Zap className="h-3.5 w-3.5 text-blue-400" />
                              <span className="text-xs font-semibold text-blue-400">
                                {subject.score} điểm
                              </span>
                            </div>
                          </div>
                          <p className="text-sm leading-relaxed text-gray-400">
                            {subject.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Recommended Majors */}
              {currentResult.recommendedMajors && currentResult.recommendedMajors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 shadow-lg">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Ngành học phù hợp</h3>
                  </div>

                  <div className="space-y-4">
                    {currentResult.recommendedMajors.map((major, index) => (
                      <motion.div
                        key={major.majorId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className="group relative overflow-hidden rounded-xl border-2 border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:scale-[1.01] hover:border-orange-500/50 hover:bg-white/10"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                        <div className="relative">
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Award className="h-5 w-5 text-orange-400" />
                              <h4 className="text-lg font-bold text-white">{major.majorName}</h4>
                            </div>
                            <div className="flex items-center gap-1.5 rounded-full bg-orange-500/20 px-3 py-1.5">
                              <TrendingUp className="h-4 w-4 text-orange-400" />
                              <span className="text-sm font-semibold text-orange-400">
                                {major.score} điểm
                              </span>
                            </div>
                          </div>

                          <p className="mb-3 text-sm leading-relaxed text-gray-400">
                            {major.description}
                          </p>

                          {major.relatedSubjects && major.relatedSubjects.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {major.relatedSubjects.map((subject, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400"
                                >
                                  {subject}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-3"
              >
                <Button
                  onClick={() => navigate('/pick-major')}
                  className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-105 hover:from-orange-600 hover:to-orange-700"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Chọn ngành học
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  onClick={() => navigate('/entry-test-list')}
                  className="rounded-xl border-2 border-white/20 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm hover:bg-white/20"
                >
                  Quay lại danh sách
                </Button>
              </motion.div>

              {/* Disclaimer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 backdrop-blur-sm"
              >
                <div className="flex gap-3">
                  <Sparkles className="h-5 w-5 flex-shrink-0 text-orange-400" />
                  <p className="text-xs leading-relaxed text-gray-400">
                    <span className="font-semibold text-orange-400">Lưu ý:</span> Kết quả chỉ mang
                    tính gợi ý dựa trên câu trả lời của bạn, không phải kết luận tuyệt đối. Hãy kết
                    hợp thêm trải nghiệm thực tế và ý kiến từ giáo viên/gia đình khi chọn môn
                    A-level.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            // ========== TEST FORM ==========
            <form onSubmit={handleSubmit} className="space-y-4">
              {test.questions?.map((q, index) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group rounded-2xl border-2 border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
                >
                  <div className="mb-4 flex items-start gap-3">
                    <div className="flex-shrink-0 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 px-3 py-1.5 shadow-lg">
                      <span className="text-sm font-bold text-white">Câu {index + 1}</span>
                    </div>
                    <h3 className="flex-1 text-base font-semibold leading-relaxed text-white">
                      {q.questionText}
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {q.options?.map((opt) => {
                      const isSelected = answers[q.id] === opt.optionCode;
                      return (
                        <label
                          key={opt.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${
                            isSelected
                              ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/20'
                              : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value={opt.optionCode}
                            className="mt-1 h-4 w-4 flex-shrink-0 accent-orange-500"
                            checked={isSelected}
                            onChange={() => handleChange(q.id, opt.optionCode)}
                          />
                          <span
                            className={`flex-1 text-sm leading-relaxed ${
                              isSelected ? 'font-medium text-white' : 'text-gray-300'
                            }`}
                          >
                            <span
                              className={`mr-2 font-bold ${
                                isSelected ? 'text-orange-400' : 'text-gray-400'
                              }`}
                            >
                              {opt.optionCode}.
                            </span>
                            {opt.optionText}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </motion.div>
              ))}

              {/* Submit Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="sticky bottom-4 rounded-2xl border border-white/10 bg-gradient-to-r from-[#1E293B] to-[#0F172A] p-6 backdrop-blur-sm shadow-2xl"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="mb-1 text-sm font-semibold text-white">
                      {allAnswered ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                          Đã hoàn thành tất cả câu hỏi!
                        </span>
                      ) : (
                        <span className="text-gray-400">
                          Vui lòng trả lời tất cả câu hỏi trước khi xem kết quả
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {Object.keys(answers).length}/{test.questions?.length || 0} câu đã trả lời
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={() => navigate('/entry-test-list')}
                      className="rounded-xl border-2 border-white/20 bg-white/10 px-5 py-2.5 font-semibold text-white backdrop-blur-sm hover:bg-white/20"
                    >
                      Quay lại
                    </Button>
                    <Button
                      type="submit"
                      disabled={!allAnswered || isSubmitting}
                      className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-2.5 font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-105 hover:from-orange-600 hover:to-orange-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5" />
                          Xem gợi ý môn học
                          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}