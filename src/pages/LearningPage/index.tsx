import { useEffect, useMemo, useRef, useState } from 'react';
import HeaderBar from './HeaderBar';
import VideoSection from './VideoSection';
import DocumentViewer from './DocumentViewer';
import LessonInfo from './LessonInfo';
import Sidebar from './Sidebar';
import AddNoteDialog from './AddNoteDialog';
import DeleteNoteDialog from './DeleteNoteDialog';
import { getYouTubeVideoId, mergeRanges, uuid } from './utils';
import { Lesson, Note, QuizItem, Topic } from './types';
import type { YouTubeProps } from 'react-youtube';
import { useParams, useSearchParams } from 'react-router-dom';
import { useGetTopicsByPagingByStudent } from '@/queries/topic.query';
import {
  useGetUserCourseById,
  useUpdateProgress
} from '@/queries/use-course.query';
import {
  useGetLessonNoteByLessonId,
  useCreateUpdateLessonNote,
  useDeleteLessonNote
} from '@/queries/lesson.query';
import { LessonType } from '@/types/api.types';

export default function VideoLearningPage() {
  const [currentLesson, setCurrentLesson] = useState<any | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<QuizItem | null>(null);
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const { mutateAsync: updateProgress } = useUpdateProgress();
  const { mutateAsync: createUpdateNote } = useCreateUpdateLessonNote();
  const { mutateAsync: deleteNote } = useDeleteLessonNote();
  const playerRef = useRef<any>(null);
  const [ytDuration, setYtDuration] = useState<number>(0);
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const lessonIdFromQuery = searchParams.get('lessonId');
  const { data: userCourseData } = useGetUserCourseById(parseInt(id || '0'));
  const [notes, setNotes] = useState<Note[]>([]);
  const [watchedRanges, setWatchedRanges] = useState<[number, number][]>([]);
  const { data: resCourse } = useGetTopicsByPagingByStudent(
    1,
    20,
    '',
    parseInt(id || '0')
  );

  const { data: notesData, refetch: refetchNotes } = useGetLessonNoteByLessonId(
    currentLesson?.id || 0
  );

  const courseData: Topic[] = useMemo(
    () => resCourse?.listObjects || [],
    [resCourse]
  );

  useEffect(() => {
    if (courseData.length > 0 && !currentLesson && !currentQuiz) {
      // Nếu có lessonId từ query param, tìm lesson đó
      if (lessonIdFromQuery) {
        const lessonId = parseInt(lessonIdFromQuery);
        for (const topic of courseData) {
          const lesson = topic.lessons.find((l) => l.id === lessonId);
          if (lesson) {
            setCurrentLesson(lesson);
            setExpandedSections([topic.id]);
            return;
          }
        }
      }

      // Nếu không có lessonId từ query, tìm lesson hiện tại
      const currentTopic = courseData.find((topic) => topic.isCurrent);

      if (currentTopic) {
        const currentLessonInTopic = currentTopic.lessons.find(
          (lesson) => lesson.isCurrent
        );

        if (currentLessonInTopic) {
          setCurrentLesson(currentLessonInTopic);
          setExpandedSections([currentTopic.id]);
        } else if (currentTopic.lessons.length > 0) {
          setCurrentLesson(currentTopic.lessons[0]);
          setExpandedSections([currentTopic.id]);
        }
      } else {
        const firstTopic = courseData[0];
        if (firstTopic && firstTopic.lessons.length > 0) {
          setCurrentLesson(firstTopic.lessons[0]);
          setExpandedSections([firstTopic.id]);
        }
      }
    }
  }, [courseData, currentLesson, currentQuiz, lessonIdFromQuery]);

  // Tự động cập nhật tiến độ cho document sau 3 giây (để đảm bảo user đang xem)
  useEffect(() => {
    if (!currentLesson || currentLesson.lessonType !== LessonType.DOCUMENT) {
      return;
    }

    const timer = setTimeout(async () => {
      await updateProgress({
        topicId: currentLesson.topicId,
        lessonId: currentLesson.id
      });
    }, 3000); // 3 giây

    return () => clearTimeout(timer);
  }, [currentLesson?.id, currentLesson?.lessonType]);

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const selectLesson = async (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setCurrentQuiz(null);
    setIsPlaying(true);

    // Cập nhật tiến độ khi chọn lesson
    await updateProgress({
      topicId: lesson.topicId,
      lessonId: lesson.id
    });
  };

  const selectQuiz = (quiz: QuizItem) => {
    setCurrentQuiz(quiz);
    setCurrentLesson(null);
  };

  const getAllLessons = (): Lesson[] => {
    // Sort topics theo orderIndex trước
    const sortedTopics = [...courseData].sort(
      (a, b) => a.orderIndex - b.orderIndex
    );

    // Với mỗi topic đã sort, lấy lessons và sort theo orderIndex
    const allLessons: Lesson[] = [];
    sortedTopics.forEach((topic) => {
      const sortedLessons = [...topic.lessons].sort(
        (a, b) => a.orderIndex - b.orderIndex
      );
      allLessons.push(...sortedLessons);
    });

    return allLessons;
  };

  const navigateLesson = async (direction: 'prev' | 'next') => {
    const allLessons = getAllLessons();
    if (!currentLesson) return;
    const idx = allLessons.findIndex((l) => l.id == currentLesson.id);
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
    setExpandedSections([allLessons[newIndex].topicId]);

    await updateProgress({
      topicId: allLessons[newIndex].topicId,
      lessonId: allLessons[newIndex].id
    });
  };

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

  useEffect(() => {
    if (!currentLesson) return;
    if (notesData) {
      setNotes(notesData || []);
    }
  }, [currentLesson?.id, notesData]);

  // State cho Add Note Dialog
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);

  // State cho Delete Note Dialog
  const [showDeleteNoteDialog, setShowDeleteNoteDialog] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [isDeletingNote, setIsDeletingNote] = useState(false);

  // Hàm mở dialog thêm note
  const onAddNote = () => {
    if (!playerRef.current || !currentLesson) return;
    setShowAddNoteDialog(true);
  };

  // Hàm lưu note - gọi API
  const handleSaveNote = async (text: string) => {
    if (!playerRef.current || !currentLesson) return;
    const tNow = Math.floor(playerRef.current.getCurrentTime() || 0);

    setIsSavingNote(true);

    const newNote: Note = {
      id: uuid(),
      time: tNow,
      text: text.trim(),
      createdAt: new Date().toISOString()
    };

    try {
      // Gọi API để lưu note
      await createUpdateNote({
        lessonId: currentLesson.id,
        time: tNow,
        text: text.trim()
      });

      // Cập nhật local state
      setNotes((prev) => [...prev, newNote]);

      // Hoặc refetch để đảm bảo sync với server
      await refetchNotes();

      // Đóng dialog
      setShowAddNoteDialog(false);
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Không thể tạo ghi chú. Vui lòng thử lại!');
    } finally {
      setIsSavingNote(false);
    }
  };

  // Hàm mở dialog xóa note
  const onDeleteNote = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      setNoteToDelete(note);
      setShowDeleteNoteDialog(true);
    }
  };

  // Hàm xác nhận xóa note - gọi API
  const handleConfirmDeleteNote = async () => {
    if (!noteToDelete || !currentLesson) return;

    setIsDeletingNote(true);

    try {
      // Gọi API xóa note
      const [err] = await deleteNote(parseInt(noteToDelete.id));

      if (err) {
        alert('Không thể xóa ghi chú. Vui lòng thử lại!');
        return;
      }

      // Cập nhật local state
      setNotes((prev) => prev.filter((x) => x.id !== noteToDelete.id));

      // Refetch để đảm bảo sync
      await refetchNotes();

      // Đóng dialog
      setShowDeleteNoteDialog(false);
      setNoteToDelete(null);
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Không thể xóa ghi chú. Vui lòng thử lại!');
    } finally {
      setIsDeletingNote(false);
    }
  };

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
        percentWatched={userCourseData?.progressPercent || 0}
        course={userCourseData}
        currentLessonTitle={currentLesson?.title}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-scroll bg-black">
          {currentLesson?.lessonType === LessonType.DOCUMENT ? (
            <DocumentViewer
              documentUrl={currentLesson.documentUrl}
              documentContent={currentLesson.documentContent}
              title={currentLesson.title}
            />
          ) : (
            <VideoSection
              currentLesson={currentLesson}
              currentQuiz={currentQuiz}
              topicForQuiz={topicForQuiz}
              videoId={videoId}
              onPlayerReady={onPlayerReady}
              onStateChange={onStateChange}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
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
          )}

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
            onDeleteNote={onDeleteNote}
            onPrevLesson={() => navigateLesson('prev')}
            onNextLesson={() => navigateLesson('next')}
            onAskNote={(note) => {
              console.log(note);
            }}
          />
        </div>

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

      {/* Add Note Dialog */}
      <AddNoteDialog
        open={showAddNoteDialog}
        onOpenChange={setShowAddNoteDialog}
        currentTime={playerRef.current?.getCurrentTime?.() ?? 0}
        onSave={handleSaveNote}
        isSaving={isSavingNote}
      />

      {/* Delete Note Dialog */}
      <DeleteNoteDialog
        open={showDeleteNoteDialog}
        onOpenChange={setShowDeleteNoteDialog}
        onConfirm={handleConfirmDeleteNote}
        noteText={noteToDelete?.text}
        isDeleting={isDeletingNote}
      />
    </div>
  );
}
