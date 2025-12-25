import {
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle,
  Clock,
  BookOpen,
  Loader2
} from 'lucide-react';
import { QuizItem, Topic, TopicQuestion } from './types';
import { useSubmitTopicQuiz, SuggestedLessonDto } from '@/queries/topic-quiz.query';
import { useState, useEffect } from 'react';
import { useRouter } from '@/routes/hooks';
import { useToast } from '@/components/ui/use-toast';

export default function QuizPanel({
  currentQuiz,
  topic,
  userTopicId,
  quizStarted,
  setQuizStarted,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  selectedAnswers,
  handleAnswerSelect,
  showResults,
  setShowResults,
  calculateScore,
  resetQuiz,
  exitQuiz
}: {
  currentQuiz: QuizItem;
  topic: Topic;
  userTopicId: number;
  quizStarted: boolean;
  setQuizStarted: (b: boolean) => void;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (fn: (prev: number) => number) => void;
  selectedAnswers: Record<number, number[]>;
  handleAnswerSelect: (
    questionId: number,
    answerId: number,
    maxChoices: number
  ) => void;
  showResults: boolean;
  setShowResults: (b: boolean) => void;
  calculateScore: (topic: Topic) => {
    correct: number;
    total: number;
    percentage: number;
  };
  resetQuiz: () => void;
  exitQuiz: () => void;
}) {
  const { mutateAsync: submitQuiz, isPending: isSubmitting } = useSubmitTopicQuiz();
  const [quizResult, setQuizResult] = useState<{ suggestedLessons: SuggestedLessonDto[] } | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Submit quiz when showing results
  useEffect(() => {
    if (showResults && !quizResult) {
      const submitQuizData = async () => {
        try {
          const [err, data] = await submitQuiz({
            topicId: topic.id,
            userTopicId: userTopicId,
            answers: selectedAnswers
          });

          if (err) {
            toast({
              title: 'Lỗi',
              description: err.message || 'Có lỗi xảy ra khi nộp bài',
              variant: 'destructive'
            });
          } else if (data?.data) {
            setQuizResult({ suggestedLessons: data.data.suggestedLessons || [] });
          }
        } catch (error: any) {
          toast({
            title: 'Lỗi',
            description: error.message || 'Có lỗi xảy ra',
            variant: 'destructive'
          });
        }
      };

      submitQuizData();
    }
  }, [showResults, quizResult, submitQuiz, topic.id, userTopicId, selectedAnswers, toast]);

  const handleNavigateToLesson = (lessonId: number, courseId: number) => {
    exitQuiz();
    router.push(`/learning/${courseId}?lessonId=${lessonId}`);
  };

  const handleResetQuiz = () => {
    setQuizResult(null);
    resetQuiz();
  };
  if (!quizStarted) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 p-8">
        <div className="w-full max-w-3xl rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mb-6 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>

          <h2 className="mb-3 text-center text-3xl font-bold text-gray-900">
            Bài Ôn Luyện
          </h2>
          <p className="mb-2 text-center text-lg text-gray-700">
            {currentQuiz.topicTitle}
          </p>
          <p className="mb-8 text-center text-gray-500">
            {currentQuiz.questionCount} câu hỏi
          </p>

          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-4">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-700">
                Hoàn thành tất cả câu hỏi để kiểm tra kiến thức
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4">
              <Clock className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-700">
                Không giới hạn thời gian làm bài
              </span>
            </div>
          </div>

          <button
            onClick={() => setQuizStarted(true)}
            className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 py-4 font-semibold text-white shadow-lg transition-all hover:from-orange-600 hover:to-orange-700 hover:shadow-xl"
          >
            Bắt Đầu Làm Bài
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore(topic);
    return (
      <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 p-8">
        <div className="w-full max-w-3xl rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mb-6 flex items-center justify-center">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-full ${
                score.percentage >= 80
                  ? 'bg-green-500'
                  : score.percentage >= 50
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
            >
              <span className="text-3xl font-bold text-white">
                {score.percentage}%
              </span>
            </div>
          </div>

          <h2 className="mb-3 text-center text-3xl font-bold text-gray-900">
            Kết Quả Bài Làm
          </h2>
          <p className="mb-8 text-center text-lg text-gray-600">
            Bạn đã trả lời đúng {score.correct}/{score.total} câu hỏi
          </p>

          <div className="mb-6 space-y-3">
            {topic.topicQuestions.map((question, idx) => {
              const userAnswers = selectedAnswers[question.id] || [];
              const correctAnswers = question.topicQuestionAnswers
                .filter((a) => a.isCorrect)
                .map((a) => a.id);
              const isCorrect =
                userAnswers.length === correctAnswers.length &&
                userAnswers.every((id) => correctAnswers.includes(id));
              return (
                <div
                  key={question.id}
                  className={`rounded-lg border-2 p-4 ${
                    isCorrect
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                  }`}
                >
                  <div className="mb-2 flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    ) : (
                      <div className="mt-0.5 h-5 w-5 flex-shrink-0 rounded-full border-2 border-red-600" />
                    )}
                    <p className="font-medium text-gray-900">
                      Câu {idx + 1}: {question.question}
                    </p>
                  </div>
                  <div className="ml-7 text-sm text-gray-600">
                    Đáp án đúng:{' '}
                    {question.topicQuestionAnswers
                      .filter((a) => correctAnswers.includes(a.id))
                      .map((a) => a.answer)
                      .join(', ')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Suggested Lessons Section */}
          {isSubmitting ? (
            <div className="mb-6 flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              <span className="ml-2 text-gray-600">Đang phân tích kết quả...</span>
            </div>
          ) : quizResult && quizResult.suggestedLessons.length > 0 && (
            <div className="mb-6 rounded-lg border-2 border-orange-200 bg-orange-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-orange-900">
                  Bài học gợi ý để củng cố kiến thức
                </h3>
              </div>
              <p className="mb-4 text-sm text-orange-800">
                Dựa trên các câu trả lời sai, chúng tôi gợi ý các bài học sau để bạn ôn tập:
              </p>
              <div className="space-y-2">
                {quizResult.suggestedLessons.map((lesson) => (
                  <div
                    key={lesson.lessonId}
                    className="flex items-center justify-between rounded-lg border border-orange-300 bg-white p-3 hover:bg-orange-50"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{lesson.lessonTitle}</p>
                      <p className="text-xs text-gray-600">
                        {lesson.courseTitle} • {lesson.topicTitle}
                      </p>
                      <p className="mt-1 text-xs text-orange-600">
                        {lesson.wrongQuestionCount} câu hỏi liên quan
                      </p>
                    </div>
                    <button
                      onClick={() => handleNavigateToLesson(lesson.lessonId, lesson.courseId)}
                      className="ml-4 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-orange-600"
                    >
                      Xem bài học
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleResetQuiz}
              className="flex-1 rounded-lg border-2 border-orange-500 bg-white py-3 font-semibold text-orange-500 transition-all hover:bg-orange-50"
            >
              Làm Lại
            </button>
            <button
              onClick={exitQuiz}
              className="flex-1 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 py-3 font-semibold text-white transition-all hover:from-orange-600 hover:to-orange-700"
            >
              Về Danh Sách Bài Học
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion: TopicQuestion =
    topic.topicQuestions[currentQuestionIndex];
  const userAnswers = selectedAnswers[currentQuestion.id] || [];
  const isLast = currentQuestionIndex === topic.topicQuestions.length - 1;

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-gray-800 to-gray-900 p-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm text-white">
            <span>
              Câu hỏi {currentQuestionIndex + 1}/{topic.topicQuestions.length}
            </span>
            <span>
              {Math.round(
                ((currentQuestionIndex + 1) / topic.topicQuestions.length) * 100
              )}
              %
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-700">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / topic.topicQuestions.length) * 100}%`
              }}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <h3 className="mb-6 text-2xl font-bold text-gray-900">
            {currentQuestion.question}
          </h3>

          {currentQuestion.maxChoices > 1 && (
            <p className="mb-4 text-sm text-blue-600">
              Chọn tối đa {currentQuestion.maxChoices} đáp án
            </p>
          )}

          <div className="space-y-3">
            {currentQuestion.topicQuestionAnswers.map((answer) => {
              const isSelected = userAnswers.includes(answer.id);
              return (
                <button
                  key={answer.id}
                  onClick={() =>
                    handleAnswerSelect(
                      currentQuestion.id,
                      answer.id,
                      currentQuestion.maxChoices
                    )
                  }
                  className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                        isSelected
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <svg viewBox="0 0 24 24" className="h-4 w-4 text-white">
                          <path
                            fill="currentColor"
                            d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.5z"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`font-medium ${isSelected ? 'text-orange-600' : 'text-gray-700'}`}
                    >
                      {answer.answer}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex gap-4">
            {currentQuestionIndex > 0 && (
              <button
                onClick={() => setCurrentQuestionIndex((p) => p - 1)}
                className="rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50"
              >
                <ChevronLeft className="mr-2 inline h-5 w-5" />
                Câu Trước
              </button>
            )}
            <button
              onClick={() =>
                isLast
                  ? setShowResults(true)
                  : setCurrentQuestionIndex((p) => p + 1)
              }
              disabled={userAnswers.length === 0}
              className="ml-auto rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 font-semibold text-white transition-all hover:from-orange-600 hover:to-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLast ? 'Xem Kết Quả' : 'Câu Tiếp Theo'}
              {!isLast && <ChevronRight className="ml-2 inline h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
