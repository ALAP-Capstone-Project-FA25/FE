import { useState, useEffect, useRef } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import {
  Play,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Lock,
  MessageCircle,
  Clock,
  BookOpen,
  User,
  FileText,
  CheckCircle
} from 'lucide-react';

interface TopicQuestionAnswer {
  topicQuestionId: number;
  answer: string;
  isCorrect: boolean;
  id: number;
  createdAt: string;
  updatedAt: string;
}

interface TopicQuestion {
  topicId: number;
  question: string;
  maxChoices: number;
  topicQuestionAnswers: TopicQuestionAnswer[];
  id: number;
  createdAt: string;
  updatedAt: string;
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  content: string;
  videoUrl: string;
  duration: number; // phút (có thể ko khớp youtube duration)
  orderIndex: number;
  isFree: boolean;
  topicId: number;
  createdAt: string;
  updatedAt: string;
}

interface Topic {
  id: number;
  title: string;
  description: string;
  orderIndex: number;
  courseId: number;
  lessons: Lesson[];
  topicQuestions: TopicQuestion[];
  createdAt: string;
  updatedAt: string;
}

interface QuizItem {
  type: 'quiz';
  topicId: number;
  topicTitle: string;
  questionCount: number;
}

interface Note {
  id: string;
  time: number; // giây
  text: string;
  createdAt: string; // ISO
}

export default function VideoLearningPage() {
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<QuizItem | null>(null);
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // --- Player refs/state ---
  const playerRef = useRef<any>(null);
  const [ytDuration, setYtDuration] = useState<number>(0); // giây

  // --- Notes ---
  const [notes, setNotes] = useState<Note[]>([]);

  // --- Watched ranges (các khoảng đã xem) ---
  const [watchedRanges, setWatchedRanges] = useState<[number, number][]>([]);

  // Sample data from document
  const courseData: Topic[] = [
    {
      title: 'Chương 1',
      description: 'GTC1',
      orderIndex: 1,
      courseId: 2,
      lessons: [
        {
          title: 'Bài chương 1',
          description: 'Bài chương 1',
          content: 'Nội dung bài học về kiến thức cơ bản',
          videoUrl: 'https://www.youtube.com/watch?v=cLKCDaNRHW0',
          duration: 12,
          orderIndex: 1231,
          isFree: false,
          topicId: 1,
          id: 1,
          createdAt: '2025-10-24T01:36:09.343929',
          updatedAt: '2025-10-24T01:36:09.344144'
        },
        {
          title: 'Bài chương 2',
          description: 'Bài chương 2',
          content: 'Bài chương 2',
          videoUrl:
            'https://www.youtube.com/watch?v=4VDJpp9QLJM&list=RD98vhlwZPtjE&index=12',
          duration: 2,
          orderIndex: 2,
          isFree: false,
          topicId: 1,
          id: 2,
          createdAt: '2025-10-24T01:36:19.780298',
          updatedAt: '0001-01-01T00:00:00'
        }
      ],
      topicQuestions: [
        {
          topicId: 1,
          question: 'Câu hỏi topic 1',
          maxChoices: 0,
          topicQuestionAnswers: [
            {
              topicQuestionId: 1,
              answer: 'Câu trả lời topic 1',
              isCorrect: true,
              id: 2,
              createdAt: '2025-11-06T18:37:51.530072',
              updatedAt: '0001-01-01T00:00:00'
            },
            {
              topicQuestionId: 1,
              answer: 'Câu trả lời topic 2',
              isCorrect: false,
              id: 3,
              createdAt: '2025-11-06T18:37:59.04604',
              updatedAt: '0001-01-01T00:00:00'
            },
            {
              topicQuestionId: 1,
              answer: 'Câu trả lời topic 3',
              isCorrect: true,
              id: 4,
              createdAt: '2025-11-06T18:38:03.618981',
              updatedAt: '0001-01-01T00:00:00'
            },
            {
              topicQuestionId: 1,
              answer: 'Câu trả lời topic 4',
              isCorrect: false,
              id: 5,
              createdAt: '2025-11-06T18:38:10.527047',
              updatedAt: '0001-01-01T00:00:00'
            }
          ],
          id: 1,
          createdAt: '2025-11-06T18:37:12.052653',
          updatedAt: '0001-01-01T00:00:00'
        },
        {
          topicId: 1,
          question: 'Câu hỏi 2',
          maxChoices: 3,
          topicQuestionAnswers: [
            {
              topicQuestionId: 3,
              answer: 'Đáp án 1',
              isCorrect: true,
              id: 6,
              createdAt: '2025-11-06T18:46:12.143221',
              updatedAt: '0001-01-01T00:00:00'
            },
            {
              topicQuestionId: 3,
              answer: 'Đáp án 2',
              isCorrect: true,
              id: 7,
              createdAt: '2025-11-06T18:46:12.163059',
              updatedAt: '0001-01-01T00:00:00'
            },
            {
              topicQuestionId: 3,
              answer: 'Đáp án 3',
              isCorrect: true,
              id: 8,
              createdAt: '2025-11-06T18:46:12.169844',
              updatedAt: '0001-01-01T00:00:00'
            },
            {
              topicQuestionId: 3,
              answer: 'Đáp án 4',
              isCorrect: false,
              id: 9,
              createdAt: '2025-11-06T18:46:12.178813',
              updatedAt: '0001-01-01T00:00:00'
            }
          ],
          id: 3,
          createdAt: '2025-11-06T18:46:11.880921',
          updatedAt: '0001-01-01T00:00:00'
        },
        {
          topicId: 1,
          question: 'Cau 3',
          maxChoices: 1,
          topicQuestionAnswers: [
            {
              topicQuestionId: 4,
              answer: '1',
              isCorrect: true,
              id: 10,
              createdAt: '2025-11-06T18:59:17.366262',
              updatedAt: '0001-01-01T00:00:00'
            },
            {
              topicQuestionId: 4,
              answer: '2',
              isCorrect: false,
              id: 11,
              createdAt: '2025-11-06T18:59:17.375737',
              updatedAt: '0001-01-01T00:00:00'
            },
            {
              topicQuestionId: 4,
              answer: '3',
              isCorrect: false,
              id: 12,
              createdAt: '2025-11-06T18:59:17.382604',
              updatedAt: '0001-01-01T00:00:00'
            },
            {
              topicQuestionId: 4,
              answer: '4',
              isCorrect: false,
              id: 13,
              createdAt: '2025-11-06T18:59:17.389457',
              updatedAt: '0001-01-01T00:00:00'
            }
          ],
          id: 4,
          createdAt: '2025-11-06T18:59:17.127352',
          updatedAt: '0001-01-01T00:00:00'
        }
      ],
      id: 1,
      createdAt: '2025-10-24T01:35:48.786766',
      updatedAt: '2025-10-24T01:35:48.786885'
    },
    {
      title: 'Chương 2',
      description: 'Chương 2',
      orderIndex: 2,
      courseId: 2,
      lessons: [],
      topicQuestions: [],
      id: 2,
      createdAt: '2025-10-24T01:35:57.295843',
      updatedAt: '0001-01-01T00:00:00'
    }
  ];

  // --- Helpers ---
  const getYouTubeVideoId = (url: string): string => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : '';
  };

  const formatTime = (s: number) => {
    const mm = Math.floor(s / 60)
      .toString()
      .padStart(2, '0');
    const ss = Math.floor(s % 60)
      .toString()
      .padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const uuid = () =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  // --- Khởi tạo bài đầu tiên ---
  useEffect(() => {
    if (courseData.length > 0 && !currentLesson && !currentQuiz) {
      const firstTopic = courseData[0];
      if (firstTopic.lessons.length > 0) {
        setCurrentLesson(firstTopic.lessons[0]);
        setExpandedSections([firstTopic.id]);
      }
    }
  }, []);

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const selectLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setCurrentQuiz(null);
    setIsPlaying(true);
  };

  const selectQuiz = (quiz: QuizItem) => {
    setCurrentQuiz(quiz);
    setCurrentLesson(null);
  };

  const getAllLessons = (): Lesson[] => {
    return courseData
      .flatMap((topic) => topic.lessons)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  };

  const navigateLesson = (direction: 'prev' | 'next') => {
    const allLessons = getAllLessons();
    if (!currentLesson) return;

    const currentIndex = allLessons.findIndex(
      (lesson) => lesson.id === currentLesson.id
    );
    if (currentIndex === -1) return;

    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : allLessons.length - 1;
    } else {
      newIndex = currentIndex < allLessons.length - 1 ? currentIndex + 1 : 0;
    }

    setCurrentLesson(allLessons[newIndex]);
  };

  // --- Quiz states (giữ nguyên phần logic quiz) ---
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: number[];
  }>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswerSelect = (
    questionId: number,
    answerId: number,
    maxChoices: number
  ) => {
    setSelectedAnswers((prev) => {
      const current = prev[questionId] || [];

      if (maxChoices === 0 || maxChoices > 1) {
        if (current.includes(answerId)) {
          return {
            ...prev,
            [questionId]: current.filter((id) => id !== answerId)
          };
        } else {
          const newAnswers =
            maxChoices === 0
              ? [...current, answerId]
              : [...current, answerId].slice(0, maxChoices);
          return { ...prev, [questionId]: newAnswers };
        }
      } else {
        return { ...prev, [questionId]: [answerId] };
      }
    });
  };

  const calculateScore = (topic: Topic) => {
    let correct = 0;
    let total = topic.topicQuestions.length;

    topic.topicQuestions.forEach((question) => {
      const userAnswers = selectedAnswers[question.id] || [];
      const correctAnswers = question.topicQuestionAnswers
        .filter((a) => a.isCorrect)
        .map((a) => a.id);

      const isCorrect =
        userAnswers.length === correctAnswers.length &&
        userAnswers.every((id) => correctAnswers.includes(id));

      if (isCorrect) correct++;
    });

    return { correct, total, percentage: Math.round((correct / total) * 100) };
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  // --- Player handlers (YouTube) ---
  const onPlayerReady: YouTubeProps['onReady'] = (e) => {
    playerRef.current = e.target;

    // lấy duration (giây) để tính toán nếu cần
    const dur = Math.floor(e.target.getDuration?.() || 0);
    setYtDuration(dur);

    // Resume từ localStorage
    if (currentLesson) {
      const saved = Number(
        localStorage.getItem(`lesson:${currentLesson.id}:lastTime`) || 0
      );
      if (saved > 3) {
        e.target.seekTo(saved, true);
      }
    }
  };

  const onStateChange: YouTubeProps['onStateChange'] = () => {
    // có thể đánh dấu trạng thái xem / đã xem nếu muốn
  };

  // --- Lưu vị trí xem dở định kỳ ---
  useEffect(() => {
    if (!currentLesson) return;

    let timer: number | undefined;

    const tick = () => {
      const tNow = Math.floor(playerRef.current?.getCurrentTime?.() ?? 0);
      localStorage.setItem(`lesson:${currentLesson.id}:lastTime`, String(tNow));
    };

    // bắt đầu đếm khi có player
    if (playerRef.current) {
      timer = window.setInterval(tick, 3000);
    }

    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [currentLesson?.id]);

  // --- Notes: load/save theo bài ---
  useEffect(() => {
    if (!currentLesson) return;
    const raw = localStorage.getItem(`lesson:${currentLesson.id}:notes`);
    setNotes(raw ? JSON.parse(raw) : []);
  }, [currentLesson?.id]);

  useEffect(() => {
    if (!currentLesson) return;
    localStorage.setItem(
      `lesson:${currentLesson.id}:notes`,
      JSON.stringify(notes)
    );
  }, [notes, currentLesson?.id]);

  const onAddNote = () => {
    if (!playerRef.current || !currentLesson) return;
    const tNow = Math.floor(playerRef.current.getCurrentTime() || 0);
    const text =
      window.prompt(`Nội dung ghi chú tại ${formatTime(tNow)}:`) || '';
    if (!text.trim()) return;
    setNotes((prev) => [
      ...prev,
      {
        id: uuid(),
        time: tNow,
        text: text.trim(),
        createdAt: new Date().toISOString()
      }
    ]);
  };

  // --- Watched ranges: load + ghi lại các khoảng đã xem ---
  useEffect(() => {
    if (!currentLesson) return;

    // load ranges cũ
    const raw = localStorage.getItem(`lesson:${currentLesson.id}:ranges`);
    setWatchedRanges(raw ? JSON.parse(raw) : []);

    let last = 0;
    let t: number | undefined;

    const tick = () => {
      const now = Math.floor(playerRef.current?.getCurrentTime?.() ?? 0);

      setWatchedRanges((prev) => {
        // nếu nhảy tua xa -> mở đoạn mới
        let next: [number, number][];
        if (Math.abs(now - last) > 5 || prev.length === 0) {
          next = mergeRanges([...prev, [now, now]]);
        } else {
          next = [...prev];
          next[next.length - 1][1] = now;
          next = mergeRanges(next);
        }
        if (currentLesson) {
          localStorage.setItem(
            `lesson:${currentLesson.id}:ranges`,
            JSON.stringify(next)
          );
        }
        return next;
      });

      last = now;
    };

    if (playerRef.current) t = window.setInterval(tick, 2000);
    return () => {
      if (t) window.clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLesson?.id]);

  function mergeRanges(ranges: [number, number][]) {
    const arr = ranges
      .map(([s, e]) => (s <= e ? [s, e] : [e, s]) as [number, number])
      .sort((a, b) => a[0] - b[0]);

    const out: [number, number][] = [];
    for (const r of arr) {
      if (!out.length || r[0] > out[out.length - 1][1] + 2)
        out.push([r[0], r[1]]);
      else out[out.length - 1][1] = Math.max(out[out.length - 1][1], r[1]);
    }
    return out;
  }

  // Tính % xem (dựa theo YouTube duration nếu có, fallback duration * 60)
  const watchedSeconds = watchedRanges.reduce(
    (sum, [s, e]) => sum + Math.max(0, e - s),
    0
  );
  const totalSeconds =
    ytDuration || (currentLesson ? currentLesson.duration * 60 : 0);
  const percentWatched = totalSeconds
    ? Math.min(100, Math.round((watchedSeconds / totalSeconds) * 100))
    : 0;

  // --- Quiz renderer (giữ nguyên, chỉ dán lại) ---
  const renderQuizContent = () => {
    if (!currentQuiz) return null;

    const topic = courseData.find((t) => t.id === currentQuiz.topicId);
    if (!topic) return null;

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

            <div className="flex gap-4">
              <button
                onClick={resetQuiz}
                className="flex-1 rounded-lg border-2 border-orange-500 bg-white py-3 font-semibold text-orange-500 transition-all hover:bg-orange-50"
              >
                Làm Lại
              </button>
              <button
                onClick={() => {
                  setCurrentQuiz(null);
                  resetQuiz();
                }}
                className="flex-1 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 py-3 font-semibold text-white transition-all hover:from-orange-600 hover:to-orange-700"
              >
                Về Danh Sách Bài Học
              </button>
            </div>
          </div>
        </div>
      );
    }

    const currentQuestion = topic.topicQuestions[currentQuestionIndex];
    const userAnswers = selectedAnswers[currentQuestion.id] || [];
    const isLastQuestion =
      currentQuestionIndex === topic.topicQuestions.length - 1;

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
                  ((currentQuestionIndex + 1) / topic.topicQuestions.length) *
                    100
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
                          <CheckCircle className="h-4 w-4 text-white" />
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
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50"
                >
                  <ChevronLeft className="mr-2 inline h-5 w-5" />
                  Câu Trước
                </button>
              )}

              <button
                onClick={() => {
                  if (isLastQuestion) {
                    setShowResults(true);
                  } else {
                    setCurrentQuestionIndex((prev) => prev + 1);
                  }
                }}
                disabled={userAnswers.length === 0}
                className="ml-auto rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 font-semibold text-white transition-all hover:from-orange-600 hover:to-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLastQuestion ? 'Xem Kết Quả' : 'Câu Tiếp Theo'}
                {!isLastQuestion && (
                  <ChevronRight className="ml-2 inline h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const videoId = currentLesson
    ? getYouTubeVideoId(currentLesson.videoUrl)
    : '';

  return (
    <div className="flex h-screen flex-col bg-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-3">
        <div className="flex items-center gap-4">
          <button className="rounded-lg p-2 text-white transition-colors hover:bg-gray-700">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 font-bold text-white">
              AP
            </div>
            <span className="font-medium text-white">Kiến Thức Nhập Môn</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Hiển thị % xem bài hiện tại nếu có */}
          <div className="flex items-center gap-2 text-sm">
            <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
              {percentWatched}%
            </span>
            <span className="text-gray-300">
              {currentLesson ? `Đang học: ${currentLesson.title}` : '—'}
            </span>
          </div>
          <button className="rounded-lg px-4 py-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white">
            <User className="mr-2 inline h-4 w-4" />
            Ghi chú
          </button>
          <button className="rounded-lg px-4 py-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white">
            <BookOpen className="mr-2 inline h-4 w-4" />
            Hướng dẫn
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Video Player Section */}
        <div className="flex flex-1 flex-col bg-black">
          {/* Video Player or Quiz */}
          <div className="relative flex flex-1 items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            {currentQuiz ? (
              renderQuizContent()
            ) : currentLesson && currentLesson.videoUrl ? (
              <div className="h-full w-full">
                {/* YouTube player với enablejsapi */}
                <YouTube
                  videoId={videoId}
                  onReady={onPlayerReady}
                  onStateChange={onStateChange}
                  opts={{
                    playerVars: {
                      autoplay: 1,
                      rel: 0,
                      modestbranding: 1,
                      enablejsapi: 1,
                      origin:
                        typeof window !== 'undefined'
                          ? window.location.origin
                          : undefined
                    }
                  }}
                  iframeClassName="h-full w-full"
                  className="h-full w-full"
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-64 w-96 items-center justify-center rounded-3xl bg-gray-700/50 backdrop-blur-sm">
                  <button
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-500 shadow-2xl transition-colors hover:bg-orange-600"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    <Play className="ml-1 h-8 w-8 fill-current text-white" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Lesson Info */}
          <div className="border-t border-gray-800 bg-gray-900 p-6">
            <div className="max-w-4xl">
              <h1 className="mb-3 text-2xl font-bold text-white">
                {currentQuiz
                  ? `Bài Ôn Luyện - ${currentQuiz.topicTitle}`
                  : currentLesson?.title || 'Chọn bài học để bắt đầu'}
              </h1>
              <p className="mb-4 text-sm text-gray-400">
                {currentQuiz
                  ? `${currentQuiz.questionCount} câu hỏi trắc nghiệm`
                  : currentLesson?.description ||
                    'Mô tả bài học sẽ hiển thị ở đây'}
              </p>

              {!currentQuiz && (
                <>
                  <div className="mb-6 flex items-center gap-4">
                    <button
                      className="rounded-lg bg-gray-800 px-4 py-2 text-white transition-colors hover:bg-gray-700"
                      onClick={onAddNote}
                    >
                      <Clock className="mr-2 inline h-4 w-4" />
                      Thêm ghi chú tại{' '}
                      {formatTime(
                        Math.floor(playerRef.current?.getCurrentTime?.() ?? 0)
                      )}
                    </button>
                    {currentLesson && (
                      <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                        {currentLesson.duration} phút
                      </span>
                    )}
                    {totalSeconds > 0 && (
                      <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                        Đã xem ~ {percentWatched}%
                      </span>
                    )}
                  </div>

                  <div className="prose prose-invert max-w-none">
                    <p className="mb-4 text-gray-300">
                      {currentLesson?.content ||
                        'Nội dung bài học sẽ hiển thị ở đây'}
                    </p>
                  </div>

                  {/* Danh sách ghi chú */}
                  <div className="mt-6">
                    <h3 className="mb-2 text-sm font-semibold text-gray-200">
                      Ghi chú của bạn
                    </h3>
                    <div className="space-y-2">
                      {notes
                        .slice()
                        .sort((a, b) => a.time - b.time)
                        .map((n) => (
                          <div
                            key={n.id}
                            className="flex items-center justify-between rounded-md border border-gray-800/50 bg-gray-800/40 px-3 py-2"
                          >
                            <button
                              className="rounded bg-gray-700 px-2 py-1 text-xs font-semibold text-white hover:bg-gray-600"
                              onClick={() =>
                                playerRef.current?.seekTo(n.time, true)
                              }
                              title="Nhảy tới mốc thời gian"
                            >
                              {formatTime(n.time)}
                            </button>
                            <p className="mx-3 flex-1 truncate text-sm text-gray-200">
                              {n.text}
                            </p>
                            <button
                              className="text-xs text-gray-400 hover:text-red-400"
                              onClick={() =>
                                setNotes((prev) =>
                                  prev.filter((x) => x.id !== n.id)
                                )
                              }
                            >
                              Xóa
                            </button>
                          </div>
                        ))}
                      {notes.length === 0 && (
                        <p className="text-sm text-gray-500">
                          Chưa có ghi chú — bấm “Thêm ghi chú” để lưu mốc thời
                          gian quan trọng.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 flex items-center gap-4 border-t border-gray-800 pt-6">
                    <button
                      className="rounded-lg border border-gray-700 bg-gray-800 px-6 py-2 text-gray-300 transition-colors hover:bg-gray-700"
                      onClick={() => navigateLesson('prev')}
                    >
                      <ChevronLeft className="mr-2 inline h-4 w-4" />
                      BÀI TRƯỚC
                    </button>
                    <button
                      className="rounded-lg bg-orange-500 px-6 py-2 text-white transition-colors hover:bg-orange-600"
                      onClick={() => navigateLesson('next')}
                    >
                      BÀI TIẾP THEO
                      <ChevronRight className="ml-2 inline h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Course Content */}
        <div className="flex w-96 flex-col border-l border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-bold text-gray-900">
              Nội dung khóa học
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              {courseData.map((section) => (
                <div key={section.id} className="mb-2">
                  <div
                    className="group flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex flex-1 items-center gap-2">
                      {expandedSections.includes(section.id) ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-sm font-medium text-gray-900">
                        {section.title}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {section.lessons.length} bài
                    </span>
                  </div>

                  {expandedSections.includes(section.id) && (
                    <div className="ml-2 mt-1 space-y-1">
                      {/* Lessons */}
                      {section.lessons.map((lesson) => {
                        const isActive = currentLesson?.id === lesson.id;
                        const isLocked = !lesson.isFree;

                        return (
                          <div
                            key={lesson.id}
                            className={`flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-all ${
                              isActive
                                ? 'border-l-4 border-orange-500 bg-orange-50'
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => !isLocked && selectLesson(lesson)}
                          >
                            <div className="mt-0.5 flex-shrink-0">
                              {isLocked ? (
                                <Lock className="h-5 w-5 text-gray-400" />
                              ) : isActive ? (
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500">
                                  <Play className="h-3 w-3 fill-current text-white" />
                                </div>
                              ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p
                                className={`mb-1 text-sm leading-snug ${
                                  isActive
                                    ? 'font-medium text-orange-600'
                                    : isLocked
                                      ? 'text-gray-400'
                                      : 'text-gray-700'
                                }`}
                              >
                                {lesson.title}
                              </p>
                              <span className="text-xs text-gray-500">
                                {lesson.duration} phút
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {/* Quiz Section */}
                      {section.topicQuestions &&
                        section.topicQuestions.length > 0 && (
                          <div
                            className={`flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-all ${
                              currentQuiz?.topicId === section.id
                                ? 'border-l-4 border-blue-500 bg-blue-50'
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() =>
                              selectQuiz({
                                type: 'quiz',
                                topicId: section.id,
                                topicTitle: section.title,
                                questionCount: section.topicQuestions.length
                              })
                            }
                          >
                            <div className="mt-0.5 flex-shrink-0">
                              {currentQuiz?.topicId === section.id ? (
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                                  <FileText className="h-3 w-3 text-white" />
                                </div>
                              ) : (
                                <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-blue-400 bg-blue-50">
                                  <FileText className="h-3 w-3 text-blue-500" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p
                                className={`mb-1 text-sm font-medium leading-snug ${
                                  currentQuiz?.topicId === section.id
                                    ? 'text-blue-600'
                                    : 'text-blue-700'
                                }`}
                              >
                                Bài ôn luyện
                              </p>
                              <span className="text-xs text-gray-500">
                                {section.topicQuestions.length} câu hỏi
                              </span>
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat Button */}
          <div className="border-t border-gray-200 p-4">
            <button className="w-full rounded-full bg-orange-500 py-3 font-semibold text-white transition-colors hover:bg-orange-600">
              <MessageCircle className="mr-2 inline h-4 w-4" />
              Hỏi đáp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
