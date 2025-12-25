import { useEffect, useMemo, useRef, useState } from 'react';
import HeaderBar from './HeaderBar';
import VideoSection from './VideoSection';
import LessonInfo from './LessonInfo';
import Sidebar from './Sidebar';
import { formatTime, getYouTubeVideoId, mergeRanges, uuid } from './utils';
import { Lesson, Note, QuizItem, Topic } from './types';
import type { YouTubeProps } from 'react-youtube';
import { useParams } from 'react-router-dom';
import { useGetTopicsByPaging } from '@/queries/topic.query';

export default function VideoLearningPage() {
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<QuizItem | null>(null);
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const playerRef = useRef<any>(null);
  const [ytDuration, setYtDuration] = useState<number>(0);
  const { id } = useParams();
  const [notes, setNotes] = useState<Note[]>([]);
  const [watchedRanges, setWatchedRanges] = useState<[number, number][]>([]);
  const { data: resCourse } = useGetTopicsByPaging(
    1,
    10,
    '',
    parseInt(id || '0')
  );

  const courseData: Topic[] = useMemo(
    () => resCourse?.listObjects || [],
    [resCourse]
  );

  // --- init first lesson ---
  useEffect(() => {
    if (courseData.length > 0 && !currentLesson && !currentQuiz) {
      const firstTopic = courseData[0];
      if (firstTopic.lessons.length > 0) {
        setCurrentLesson(firstTopic.lessons[0]);
        setExpandedSections([firstTopic.id]);
      }
    }
  }, [courseData, currentLesson, currentQuiz]);

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

  const getAllLessons = (): Lesson[] =>
    courseData
      .flatMap((t) => t.lessons)
      .sort((a, b) => a.orderIndex - b.orderIndex);

  const navigateLesson = (direction: 'prev' | 'next') => {
    const allLessons = getAllLessons();
    if (!currentLesson) return;
    const idx = allLessons.findIndex((l) => l.id === currentLesson.id);
    if (idx === -1) return;
    const newIndex =
      direction === 'prev'
        ? idx > 0
          ? idx - 1
          : allLessons.length - 1
        : idx < allLessons.length - 1
          ? idx + 1
          : 0;
    setCurrentLesson(allLessons[newIndex]);
  };

  // --- Quiz states (giữ nguyên) ---
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number[]>
  >({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswerSelect = (
    questionId: number,
    answerId: number,
    maxChoices: number
  ) => {
    setSelectedAnswers((prev) => {
      const current = prev[questionId] || [];
      if (maxChoices === 0 || maxChoices > 1) {
        if (current.includes(answerId))
          return {
            ...prev,
            [questionId]: current.filter((id) => id !== answerId)
          };
        const newAnswers =
          maxChoices === 0
            ? [...current, answerId]
            : [...current, answerId].slice(0, maxChoices);
        return { ...prev, [questionId]: newAnswers };
      } else {
        return { ...prev, [questionId]: [answerId] };
      }
    });
  };

  const calculateScore = (topic: Topic) => {
    let correct = 0;
    let total = topic.topicQuestions.length;
    topic.topicQuestions.forEach((q) => {
      const userAnswers = selectedAnswers[q.id] || [];
      const correctAnswers = q.topicQuestionAnswers
        .filter((a) => a.isCorrect)
        .map((a) => a.id);
      const isCorrect =
        userAnswers.length === correctAnswers.length &&
        userAnswers.every((id) => correctAnswers.includes(id));
      if (isCorrect) correct++;
    });
    return {
      correct,
      total,
      percentage: total ? Math.round((correct / total) * 100) : 0
    };
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  const exitQuiz = () => {
    setCurrentQuiz(null);
    resetQuiz();
  };

  // --- Player handlers ---
  const onPlayerReady: YouTubeProps['onReady'] = (e) => {
    playerRef.current = e.target;
    const dur = Math.floor(e.target.getDuration?.() || 0);
    setYtDuration(dur);

    if (currentLesson) {
      const saved = Number(
        localStorage.getItem(`lesson:${currentLesson.id}:lastTime`) || 0
      );
      if (saved > 3) e.target.seekTo(saved, true);
    }
  };
  const onStateChange: YouTubeProps['onStateChange'] = () => {};

  // --- Autosave current time ---
  useEffect(() => {
    if (!currentLesson) return;
    let timer: number | undefined;
    const tick = () => {
      const tNow = Math.floor(playerRef.current?.getCurrentTime?.() ?? 0);
      localStorage.setItem(`lesson:${currentLesson.id}:lastTime`, String(tNow));
    };
    if (playerRef.current) timer = window.setInterval(tick, 3000);
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [currentLesson?.id]);

  // --- Notes load/save ---
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

  // --- Watched ranges ---
  useEffect(() => {
    if (!currentLesson) return;
    const raw = localStorage.getItem(`lesson:${currentLesson.id}:ranges`);
    setWatchedRanges(raw ? JSON.parse(raw) : []);

    let last = 0;
    let t: number | undefined;

    const tick = () => {
      const now = Math.floor(playerRef.current?.getCurrentTime?.() ?? 0);
      setWatchedRanges((prev) => {
        let next: [number, number][];
        if (Math.abs(now - last) > 5 || prev.length === 0) {
          next = mergeRanges([...prev, [now, now]]);
        } else {
          next = [...prev];
          next[next.length - 1][1] = now;
          next = mergeRanges(next);
        }
        if (currentLesson)
          localStorage.setItem(
            `lesson:${currentLesson.id}:ranges`,
            JSON.stringify(next)
          );
        return next;
      });
      last = now;
    };

    if (playerRef.current) t = window.setInterval(tick, 2000);
    return () => {
      if (t) window.clearInterval(t);
    };
  }, [currentLesson?.id]);

  const watchedSeconds = watchedRanges.reduce(
    (sum, [s, e]) => sum + Math.max(0, e - s),
    0
  );
  const totalSeconds =
    ytDuration || (currentLesson ? currentLesson.duration * 60 : 0);
  const percentWatched = totalSeconds
    ? Math.min(100, Math.round((watchedSeconds / totalSeconds) * 100))
    : 0;

  const topicForQuiz = currentQuiz
    ? courseData.find((t) => t.id === currentQuiz.topicId) || null
    : null;
  const videoId = currentLesson
    ? getYouTubeVideoId(currentLesson.videoUrl)
    : '';

  return (
    <div className="flex h-screen flex-col bg-gray-900">
      <HeaderBar
        percentWatched={percentWatched}
        currentLessonTitle={currentLesson?.title}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Player + Info */}
        <div className="flex flex-1 flex-col bg-black">
          <VideoSection
            currentLesson={currentLesson}
            currentQuiz={currentQuiz}
            topicForQuiz={topicForQuiz}
            videoId={videoId}
            onPlayerReady={onPlayerReady}
            onStateChange={onStateChange}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            // quiz props
            quizStarted={quizStarted}
            setQuizStarted={setQuizStarted}
            currentQuestionIndex={currentQuestionIndex}
            setCurrentQuestionIndex={setCurrentQuestionIndex}
            selectedAnswers={selectedAnswers}
            handleAnswerSelect={handleAnswerSelect}
            showResults={showResults}
            setShowResults={setShowResults}
            calculateScore={calculateScore}
            resetQuiz={resetQuiz}
            exitQuiz={exitQuiz}
          />

          <LessonInfo
            currentLesson={currentLesson}
            currentQuizTitle={currentQuiz?.topicTitle}
            currentQuizCount={currentQuiz?.questionCount}
            currentTime={playerRef.current?.getCurrentTime?.() ?? 0}
            onAddNote={onAddNote}
            durationMinutes={currentLesson?.duration}
            percentWatched={percentWatched}
            content={currentLesson?.content}
            notes={notes}
            onJumpNote={(t) => playerRef.current?.seekTo(t, true)}
            onDeleteNote={(id) =>
              setNotes((prev) => prev.filter((x) => x.id !== id))
            }
            onPrevLesson={() => navigateLesson('prev')}
            onNextLesson={() => navigateLesson('next')}
            onAskNote={(note) => {
              console.log(note);
            }}
          />
        </div>

        {/* Sidebar */}
        <Sidebar
          courseData={courseData}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          currentLesson={currentLesson}
          currentQuiz={currentQuiz}
          selectLesson={selectLesson}
          selectQuiz={selectQuiz}
        />
      </div>
    </div>
  );
}
