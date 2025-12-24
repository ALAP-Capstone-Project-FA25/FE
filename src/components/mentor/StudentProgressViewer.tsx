import { useEffect, useState, useRef } from 'react';
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

import { useGetStudentProgress, useGetStudentNotes, useGetCourseTopicsForMentor } from '@/queries/mentor.query';

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
  const playerRef = useRef<any>(null);

  // Fetch student progress data
  const { isLoading: isLoadingProgress, error: progressError } = 
    useGetStudentProgress(studentId, courseId);
  
  const { data: notesData, isLoading: isLoadingNotes } = 
    useGetStudentNotes(studentId, currentLesson?.id || 0);
    
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
  }, [topicsData, currentLesson, currentQuiz]);

  // Update notes when notes data is loaded
  useEffect(() => {
    if (notesData?.notes) {
      setNotes(notesData.notes);
    } else {
      setNotes([]);
    }
  }, [notesData]);

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
  };

  const selectQuiz = (quiz: QuizItem) => {
    setCurrentQuiz(quiz);
    setCurrentLesson(null);
  };

  // Player ready callback
  const onPlayerReady = (player: any) => {
    playerRef.current = player;
  };

  // Disabled functions for read-only mode
  const onAddNote = () => {};
  const onDeleteNote = () => {};
  const onJumpNote = (time: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
    }
  };
  const onPrevLesson = () => {};
  const onNextLesson = () => {};
  const onAskNote = () => {};

  const videoId = currentLesson ? getYouTubeVideoId(currentLesson.videoUrl) : '';
  const topicForQuiz = currentQuiz
    ? courseData.find((t) => t.id === currentQuiz.topicId) || null
    : null;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
          <p className="mt-2 text-sm text-gray-600">Đang tải tiến độ học tập...</p>
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
          <div className="text-xs text-gray-400">
            ID: {studentId} | Course: {courseId} | Notes: {notes.length}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 overflow-scroll flex-col bg-black">
          {!currentLesson && !currentQuiz ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-gray-400">
                <p className="text-lg mb-2">Chọn một bài học để xem tiến độ</p>
                <p className="text-sm">Sử dụng sidebar bên phải để chọn bài học</p>
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