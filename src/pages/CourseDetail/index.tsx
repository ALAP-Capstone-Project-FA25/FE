import { useState } from 'react';
import {
  Play,
  ChevronDown,
  ChevronRight,
  Clock,
  BookOpen,
  BarChart3,
  Video
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useGetTopicsByCourseId,
  useGetTopicsByCourseIdWithCourse
} from '@/queries/topic.query';
import { useParams } from 'react-router-dom';
import __helpers from '@/helpers';
import { useRouter } from '@/routes/hooks';

export default function CourseDetailPage() {
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const { id } = useParams<{ id: string }>();
  const { data } = useGetTopicsByCourseIdWithCourse(parseInt(id || '0'));
  console.log(data);
  const courseData = data?.topics?.listObjects || [];
  const courseInfo = data?.course || {};

  // Helper function to format duration from seconds to MM:SS
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate total lessons and duration
  const totalLessons = courseData.reduce(
    (total, topic) => total + (topic.lessons?.length || 0),
    0
  );
  const totalDuration = courseData.reduce((total, topic) => {
    return (
      total +
      (topic.lessons?.reduce(
        (topicTotal, lesson) => topicTotal + (lesson.duration || 0),
        0
      ) || 0)
    );
  }, 0);

  const formatTotalDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    }
    return `${minutes} phút`;
  };

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const toggleAllSections = () => {
    if (expandedSections.length === courseData.length) {
      setExpandedSections([]);
    } else {
      setExpandedSections(courseData.map((topic) => topic.id));
    }
  };

  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Content */}
          <div className="lg:col-span-2">
            <div className="mb-6 rounded-lg bg-white p-8 shadow-sm">
              <h1 className="mb-4 text-3xl font-bold text-gray-900">
                {courseInfo.title}
              </h1>
              <p className="leading-relaxed text-gray-600">
                {courseInfo.description}
              </p>
            </div>

            {/* Course Content */}
            <div className="rounded-lg bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Nội dung khóa học
                </h2>
                <button
                  onClick={toggleAllSections}
                  className="rounded-md border border-orange-200 px-3 py-1 text-sm text-orange-500 transition-colors hover:bg-orange-50"
                >
                  {expandedSections.length === courseData.length
                    ? 'Thu gọn tất cả'
                    : 'Mở rộng tất cả'}
                </button>
              </div>

              <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">{courseData.length} chương</span>
                <span>•</span>
                <span>{totalLessons} bài học</span>
                <span>•</span>
                <span>Thời lượng {formatTotalDuration(totalDuration)}</span>
              </div>

              <div className="space-y-2">
                {courseData.map((topic) => (
                  <div
                    key={topic.id}
                    className="overflow-hidden rounded-lg border border-gray-200"
                  >
                    <div
                      className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-gray-50"
                      onClick={() => toggleSection(topic.id)}
                    >
                      <div className="flex items-center gap-3">
                        {expandedSections.includes(topic.id) ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                        <span className="font-medium text-gray-900">
                          {topic.title}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {topic.lessons?.length || 0} bài học
                      </span>
                    </div>

                    {expandedSections.includes(topic.id) &&
                      topic.lessons &&
                      topic.lessons.length > 0 && (
                        <div className="border-t border-gray-200 bg-gray-50">
                          {topic.lessons.map((lesson, index) => (
                            <div
                              key={lesson.id}
                              className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-white"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-300">
                                  <Play className="h-3 w-3 fill-current text-white" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-gray-700">
                                    {lesson.title}
                                  </span>
                                  {lesson.description && (
                                    <span className="text-xs text-gray-500">
                                      {lesson.description}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {lesson.isFree && (
                                  <Badge
                                    variant="outline"
                                    className="border-green-200 text-xs text-green-600"
                                  >
                                    Miễn phí
                                  </Badge>
                                )}
                                <span className="text-sm text-gray-500">
                                  {formatDuration(lesson.duration || 0)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 overflow-hidden shadow-lg">
              {/* Video Preview */}
              <div
                className="relative flex h-64 items-center justify-center"
                style={{
                  backgroundImage: `url(${courseInfo.imageUrl})`,
                  backgroundColor: '#f0f0f0',
                  backgroundSize: 'contain',
                  backgroundPosition: 'center'
                }}
              >
                <div className="h-full w-full text-center">
                  <img
                    src={courseInfo.imageUrl}
                    alt={courseInfo.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <CardContent className="p-6">
                <div className="mb-6 text-center">
                  <div className="mb-4 text-3xl font-bold text-orange-500">
                    <p className="text-2xl font-bold text-orange-500">
                      Giá: {__helpers.formatCurrency(courseInfo.salePrice)} vnd
                    </p>
                  </div>
                  <Button
                    className="w-full rounded-full bg-blue-500 py-6 text-base font-semibold text-white hover:bg-blue-600"
                    onClick={() => router.push(`/learning/${id}`)}
                  >
                    VÀO HỌC
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <BarChart3 className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        Trình độ cơ bản
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <BookOpen className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        Tổng số{' '}
                        <span className="font-bold">
                          {totalLessons} bài học
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        Thời lượng{' '}
                        <span className="font-bold">
                          {formatTotalDuration(totalDuration)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Video className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        Học mọi lúc, mọi nơi
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
