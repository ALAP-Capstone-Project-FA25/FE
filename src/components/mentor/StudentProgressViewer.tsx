import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Import LearningPage components for reuse
import DocumentViewer from '@/pages/LearningPage/DocumentViewer';
import LessonInfo from '@/pages/LearningPage/LessonInfo';
import Sidebar from '@/pages/LearningPage/Sidebar';
import { getYouTubeVideoId } from '@/pages/LearningPage/utils';
import { Lesson, Note, QuizItem, Topic } from '@/pages/LearningPage/types';
import { LessonType } from '@/types/api.types';

// Import mentor-specific components
import ReadOnlyVideoSection from './ReadOnlyVideoSection';

import {
  useGetStudentProgress,
  useGetStudentNotes,
  useGetCourseTopicsForMentor
} from '@/queries/mentor.query';

interface StudentProgressViewerProps {
  studentId: number;
  courseId: number;
  isReadOnly: boolean;
}

export default function StudentProgressViewer({
  studentId,
  courseId,
  isReadOnly
}: StudentProgressViewerProps) {
  const [currentLesson, setCurrentLesson] = useState<any | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<QuizItem | null>(null);
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [courseData, setCourseData] = useState<Topic[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const playerRef = useRef<any>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch student progress data
  const { isLoading: isLoadingProgress, error: progressError } =
    useGetStudentProgress(studentId, courseId);

  const { data: notesData, isLoading: isLoadingNotes } = useGetStudentNotes(
    studentId,
    currentLesson?.id || 0
  );

  // Fetch course topics for sidebar
  const { data: topicsData, isLoading: isLoadingTopics } =
    useGetCourseTopicsForMentor(courseId, studentId);

  const isLoading = isLoadingProgress || isLoadingNotes || isLoadingTopics;
  const error = progressError ? 'Không thể tải dữ liệu tiến độ học tập' : null;

  // Update course data when topics data is loaded
  useEffect(() => {
    if (topicsData?.listObjects) {
      setCourseData(topicsData.listObjects);

      // Auto-select first lesson if none selected
      if (!currentLesson && !currentQuiz && topicsData.listObjects.length > 0) {
        const firstTopic = topicsData.listObjects[0];
        if (firstTopic.lessons && firstTopic.lessons.length > 0) {
          setCurrentLesson(firstTopic.lessons[0]);
          setExpandedSections([firstTopic.id]);
        }
      }
    } else {
      setCourseData([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicsData]);

  // Update notes when notes data is loaded
  useEffect(() => {
    if (notesData?.notes) {
      setNotes(notesData.notes);
    } else {
      setNotes([]);
    }
  }, [notesData]);

  const toggleSection = useCallback((sectionId: number) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  }, []);

  const selectLesson = useCallback(
    (lesson: Lesson) => {
      // Prevent multiple rapid clicks
      if (isTransitioning) return;

      setIsTransitioning(true);
      setCurrentLesson(lesson);
      setCurrentQuiz(null);

      // Clear existing timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      // Reset transitioning state after a short delay
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    },
    [isTransitioning]
  );

  const selectQuiz = useCallback(
    (quiz: QuizItem) => {
      // Prevent multiple rapid clicks
      if (isTransitioning) return;

      setIsTransitioning(true);
      setCurrentQuiz(quiz);
      setCurrentLesson(null);

      // Clear existing timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      // Reset transitioning state after a short delay
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    },
    [isTransitioning]
  );

  // Player ready callback
  const onPlayerReady = useCallback((player: any) => {
    playerRef.current = player;
  }, []);

  // Disabled functions for read-only mode
  const onAddNote = useCallback(() => {}, []);
  const onDeleteNote = useCallback(() => {}, []);
  const onJumpNote = useCallback((time: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
    }
  }, []);
  const onPrevLesson = useCallback(() => {}, []);
  const onNextLesson = useCallback(() => {}, []);
  const onAskNote = useCallback(() => {}, []);

  // Memoize computed values
  const videoId = useMemo(() => {
    return currentLesson ? getYouTubeVideoId(currentLesson.videoUrl) : '';
  }, [currentLesson?.videoUrl]);

  const topicForQuiz = useMemo(() => {
    return currentQuiz
      ? courseData.find((t) => t.id === currentQuiz.topicId) || null
      : null;
  }, [currentQuiz, courseData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
          <p className="mt-2 text-sm text-gray-600">
            Đang tải tiến độ học tập...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-gray-900">
      {/* Progress header - TODO: Add progress bar */}
      <div className="border-b border-gray-700 bg-gray-800 p-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-300">
            Đang xem tiến độ của học viên (chỉ đọc)
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex flex-1 flex-col overflow-scroll bg-black">
          {/* Transition overlay */}
          {isTransitioning && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-orange-500" />
                <p className="mt-2 text-sm text-gray-300">
                  Đang tải bài học...
                </p>
              </div>
            </div>
          )}

          {!currentLesson && !currentQuiz ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-gray-400">
                <p className="mb-2 text-lg">Chọn một bài học để xem tiến độ</p>
                <p className="text-sm">
                  Sử dụng sidebar bên phải để chọn bài học
                </p>
              </div>
            </div>
          ) : currentLesson?.lessonType === LessonType.DOCUMENT ? (
            <DocumentViewer
              documentUrl={currentLesson.documentUrl}
              documentContent={currentLesson.documentContent}
              title={currentLesson.title}
            />
          ) : (
            <ReadOnlyVideoSection
              currentLesson={currentLesson}
              currentQuiz={currentQuiz}
              topicForQuiz={topicForQuiz}
              videoId={videoId}
              studentId={studentId}
              onPlayerReady={onPlayerReady}
            />
          )}

          <LessonInfo
            currentLesson={currentLesson}
            currentQuizTitle={currentQuiz?.topicTitle}
            currentQuizCount={currentQuiz?.questionCount}
            currentTime={0} // TODO: Get real current time from student progress
            onAddNote={onAddNote} // Disabled for read-only
            durationMinutes={currentLesson?.duration}
            percentWatched={0} // TODO: Get real progress
            content={currentLesson?.content}
            notes={notes}
            onJumpNote={onJumpNote} // Disabled for read-only
            onDeleteNote={onDeleteNote} // Disabled for read-only
            onPrevLesson={onPrevLesson} // Disabled for read-only
            onNextLesson={onNextLesson} // Disabled for read-only
            onAskNote={onAskNote} // Disabled for read-only
            isReadOnly={true}
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
    </div>
  );
}
