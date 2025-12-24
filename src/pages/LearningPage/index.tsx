import { useState, useEffect } from 'react';
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
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetTopicsByCourseId } from '@/queries/topic.query';
import { useParams } from 'react-router-dom';

interface Lesson {
  id: number;
  title: string;
  description: string;
  content: string;
  videoUrl: string;
  duration: number;
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
  createdAt: string;
  updatedAt: string;
}

export default function VideoLearningPage() {
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const { id } = useParams<{ id: string }>();
  const { data } = useGetTopicsByCourseId(parseInt(id || '0'));

  const courseData: Topic[] = data?.listObjects || [];

  // Tự động chọn bài học đầu tiên khi có dữ liệu
  useEffect(() => {
    if (courseData.length > 0 && !currentLesson) {
      const firstTopic = courseData[0];
      if (firstTopic.lessons.length > 0) {
        setCurrentLesson(firstTopic.lessons[0]);
        setExpandedSections([firstTopic.id]);
      }
    }
  }, [courseData, currentLesson]);

  const getYouTubeVideoId = (url: string): string => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : '';
  };

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Hàm chọn bài học
  const selectLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setIsPlaying(true);
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

  return (
    <div className="flex h-screen flex-col bg-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-gray-700"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 font-bold text-white">
              AP
            </div>
            <span className="font-medium text-white">Kiến Thức Nhập Môn</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm">
            <Badge className="bg-blue-600 hover:bg-blue-700">32%</Badge>
            <span className="text-gray-300">3/12 bài học</span>
          </div>
          <Button
            variant="ghost"
            className="text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <User className="mr-2 h-4 w-4" />
            Ghi chú
          </Button>
          <Button
            variant="ghost"
            className="text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Hướng dẫn
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Video Player Section */}
        <div className="flex flex-1 flex-col bg-black">
          {/* Video Player */}
          <div className="relative flex flex-1 items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            {currentLesson && currentLesson.videoUrl ? (
              <div className="h-full w-full">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(currentLesson.videoUrl)}?autoplay=1&rel=0&modestbranding=1`}
                  title={currentLesson.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-64 w-96 items-center justify-center rounded-3xl bg-gray-700/50 backdrop-blur-sm">
                  <Button
                    size="lg"
                    className="h-20 w-20 rounded-full bg-orange-500 shadow-2xl hover:bg-orange-600"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    <Play className="ml-1 h-8 w-8 fill-current text-white" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Lesson Info */}
          <div className="border-t border-gray-800 bg-gray-900 p-6">
            <div className="max-w-4xl">
              <h1 className="mb-3 text-2xl font-bold text-white">
                {currentLesson?.title || 'Chọn bài học để bắt đầu'}
              </h1>
              <p className="mb-4 text-sm text-gray-400">
                {currentLesson?.description ||
                  'Mô tả bài học sẽ hiển thị ở đây'}
              </p>

              <div className="mb-6 flex items-center gap-4">
                <Button className="bg-gray-800 text-white hover:bg-gray-700">
                  <Clock className="mr-2 h-4 w-4" />
                  Thêm ghi chú tại 00:00
                </Button>
                {currentLesson && (
                  <Badge className="bg-blue-600 hover:bg-blue-700">
                    {currentLesson.duration} phút
                  </Badge>
                )}
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="mb-4 text-gray-300">
                  {currentLesson?.content ||
                    'Nội dung bài học sẽ hiển thị ở đây'}
                </p>
              </div>

              <div className="mt-8 flex items-center gap-4 border-t border-gray-800 pt-6">
                <Button
                  variant="outline"
                  className="border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
                  onClick={() => navigateLesson('prev')}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  BÀI TRƯỚC
                </Button>
                <Button
                  className="bg-orange-500 text-white hover:bg-orange-600"
                  onClick={() => navigateLesson('next')}
                >
                  BÀI TIẾP THEO
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
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
                    className="group flex cursor-pointer items-center justify-between rounded-lg p-3 hover:bg-gray-50"
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

                  {expandedSections.includes(section.id) &&
                    section.lessons.length > 0 && (
                      <div className="ml-2 mt-1 space-y-1">
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
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat Button */}
          <div className="border-t border-gray-200 p-4">
            <Button className="w-full rounded-full bg-orange-500 text-white hover:bg-orange-600">
              <MessageCircle className="mr-2 h-4 w-4" />
              Hỏi đáp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
