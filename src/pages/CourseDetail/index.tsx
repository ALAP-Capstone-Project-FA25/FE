import { useState, useEffect } from 'react';
import {
  Play,
  ChevronDown,
  ChevronRight,
  Clock,
  BookOpen,
  Video,
  CheckCircle2,
  Award,
  Loader2,
  Star
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetTopicsByCourseIdWithCourse } from '@/queries/topic.query';
import { useParams } from 'react-router-dom';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';
import __helpers from '@/helpers';
import { useRouter } from '@/routes/hooks';
import { useAuth } from '@/routes/hooks/use.auth';
import LoginDialog from '@/components/auth/login-dialog';
import { useEnrollCourse } from '@/queries/course.query';
import { CourseType } from '@/types/api.types';
import { toast } from '@/components/ui/use-toast';

export default function CourseDetailPage() {
  const [expandedSections, setExpandedSections] = useState<number[]>([0]);
  const { id } = useParams<{ id: string }>();
  const { data } = useGetTopicsByCourseIdWithCourse(parseInt(id || '0'));
  const courseData = data?.topics?.listObjects || [];
  const courseInfo = data?.course || {};
  const { data: authInfo } = useAuth();
  console.log(authInfo);

  // Tour guide state
  const [runTour, setRunTour] = useState(false);

  // Tour steps cho CourseDetail - bỏ step 1, thay step 4
  const courseDetailSteps: Step[] = [
    {
      target: '.course-content',
      content:
        'Danh sách tất cả các chương và bài học trong khóa học. Bạn có thể mở rộng để xem chi tiết.',
      title: 'Nội dung khóa học',
      placement: 'right',
      disableBeacon: true
    },
    {
      target: '.course-sidebar',
      content:
        'Khu vực này chứa nút đăng ký khóa học và thông tin chi tiết về khóa học.',
      title: 'Đăng ký khóa học',
      placement: 'left'
    },
    {
      target: '.buy-package-button',
      content:
        'Mua gói học ngay giúp bạn có thể học toàn bộ các khóa học được cung cấp bởi hệ thống.',
      title: 'Mua gói học ngay',
      placement: 'top'
    }
  ];

  // Handle tour callback
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      localStorage.setItem('course-detail-tour-seen', 'true');
    }
  };

  // Tự động bắt đầu tour khi có dữ liệu khóa học (chỉ 1 lần)
  useEffect(() => {
    if (courseInfo.id && courseData.length > 0) {
      const hasSeenTour = localStorage.getItem('course-detail-tour-seen');
      if (!hasSeenTour) {
        setTimeout(() => {
          setRunTour(true);
        }, 1500); // Delay 1.5s để UI render xong
      }
    }
  }, [courseInfo.id, courseData.length]);
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const toggleAllSections = () => {
    setExpandedSections(
      expandedSections.length === courseData.length
        ? []
        : courseData.map((topic) => topic.id)
    );
  };

  const router = useRouter();
  const isEnrolled = authInfo?.userCourses?.some(
    (course) => course.courseId === parseInt(id || '0')
  );

  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const userHasPackage = authInfo?.userPackages.length > 0;

  const { mutateAsync: enrollCourse, isPending } = useEnrollCourse();

  const handleEnrollCourse = async () => {
    const [err] = await enrollCourse({ courseId: parseInt(id || '0') });

    if (err) {
      toast({
        title: 'Lỗi',
        description: err.message || 'Có lỗi xảy ra',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Thành công',
        description: 'Bạn đã đăng ký khóa học thành công',
        variant: 'success'
      });
      router.push(`/learning/${id}`);
    }
  };

  return (
    <>
      {/* Tour Guide */}
      <Joyride
        steps={courseDetailSteps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#f97316', // orange-500
            zIndex: 10000
          },
          tooltip: {
            borderRadius: 12,
            padding: 20
          },
          buttonNext: {
            backgroundColor: '#f97316',
            borderRadius: 8,
            padding: '8px 16px'
          },
          buttonSkip: {
            color: '#6b7280'
          }
        }}
        locale={{
          back: 'Quay lại',
          close: 'Đóng',
          last: 'Hoàn thành',
          next: 'Tiếp theo',
          skip: 'Bỏ qua'
        }}
      />

      <div className="min-h-screen bg-gray-200/50">
        <LoginDialog
          open={isLoginDialogOpen}
          onOpenChange={setIsLoginDialogOpen}
        />

        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-4 lg:col-span-2">
              {/* Course Header - Compact */}
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <div className="mb-2">
                  <Badge className="border-orange-200 bg-orange-50 text-xs text-orange-700">
                    <Award className="mr-1 h-3 w-3" />
                    Khóa học phổ biến
                  </Badge>
                </div>

                <h1 className="mb-2 text-xl font-bold text-gray-900 lg:text-2xl">
                  {courseInfo.title}
                </h1>

                <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                  {courseInfo.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-orange-600" />
                    <span>{formatTotalDuration(totalDuration)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3 text-orange-600" />
                    <span>{totalLessons} bài học</span>
                  </div>
                  {courseInfo.courseType && (
                    <div className="flex items-center gap-1">
                      <Badge
                        variant="outline"
                        className={
                          courseInfo.courseType === CourseType.AS_LEVEL
                            ? 'border-blue-500 text-xs text-blue-700'
                            : courseInfo.courseType === CourseType.A2_LEVEL
                              ? 'border-green-500 text-xs text-green-700'
                              : 'border-purple-500 text-xs text-purple-700'
                        }
                      >
                        {courseInfo.courseType === CourseType.AS_LEVEL
                          ? 'AS Level'
                          : courseInfo.courseType === CourseType.A2_LEVEL
                            ? 'A2 Level'
                            : 'Cả hai'}
                      </Badge>
                    </div>
                  )}
                  {courseInfo.difficulty && (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">Độ khó:</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`h-3 w-3 ${
                              index < courseInfo.difficulty
                                ? 'fill-orange-500 text-orange-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Course Content - Enhanced */}
              <Card className="course-content shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="mb-2 text-xl font-bold text-gray-900">
                        Nội dung khóa học
                      </h2>
                      <p className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4 text-orange-500" />
                          {courseData.length} chương
                        </span>
                        <span className="flex items-center gap-1">
                          <Video className="h-4 w-4 text-orange-500" />
                          {totalLessons} bài học
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-orange-500" />
                          {formatTotalDuration(totalDuration)}
                        </span>
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleAllSections}
                      className="border-orange-200 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"
                    >
                      {expandedSections.length === courseData.length
                        ? 'Thu gọn tất cả'
                        : 'Mở rộng tất cả'}
                    </Button>
                  </div>

                  <div className="max-h-96 space-y-3 overflow-y-auto">
                    {courseData.map((topic, topicIndex) => (
                      <div
                        key={topic.id}
                        className="rounded-lg border border-gray-200 shadow-sm"
                      >
                        <div
                          className="flex cursor-pointer items-center justify-between bg-orange-50 p-4 transition-colors duration-200 hover:bg-orange-100"
                          onClick={() => toggleSection(topic.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white shadow-sm">
                              {topicIndex + 1}
                            </div>
                            <div>
                              <span className="block text-sm font-semibold text-gray-900">
                                {topic.title}
                              </span>
                              <div className="mt-1 text-xs text-gray-600">
                                {topic.lessons?.length || 0} bài học •{' '}
                                {topic.lessons?.reduce(
                                  (total, lesson) =>
                                    total + (lesson.duration || 0),
                                  0
                                )
                                  ? formatTotalDuration(
                                      topic.lessons.reduce(
                                        (total, lesson) =>
                                          total + (lesson.duration || 0),
                                        0
                                      )
                                    )
                                  : '0m'}
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {expandedSections.includes(topic.id) ? (
                              <ChevronDown className="h-5 w-5 text-orange-600" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {expandedSections.includes(topic.id) &&
                          topic.lessons?.length > 0 && (
                            <div className="border-t bg-white">
                              {topic.lessons.map((lesson, lessonIndex) => (
                                <div
                                  key={lesson.id}
                                  className="flex items-center justify-between border-b px-4 py-3 transition-colors duration-200 last:border-b-0 hover:bg-gray-50"
                                >
                                  <div className="flex flex-1 items-center gap-3">
                                    <div className="flex-shrink-0">
                                      <Play className="h-4 w-4 text-orange-500" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <span className="block truncate text-sm font-medium text-gray-800">
                                        {lessonIndex + 1}. {lesson.title}
                                      </span>
                                      {lesson.description && (
                                        <span className="mt-1 line-clamp-1 block text-xs text-gray-500">
                                          {lesson.description}
                                        </span>
                                      )}
                                    </div>
                                    {lesson.isFree && (
                                      <Badge
                                        variant="outline"
                                        className="border-green-200 bg-green-50 px-2 py-1 text-xs text-green-700"
                                      >
                                        Miễn phí
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="ml-3 flex-shrink-0">
                                    <span className="text-xs font-medium text-gray-500">
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
                </CardContent>
              </Card>

              {/* What you'll learn - Compact */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="mb-3 text-lg font-bold text-gray-900">
                    Bạn sẽ học được gì?
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[
                      'Nắm vững kiến thức nền tảng',
                      'Thực hành qua dự án thực tế',
                      'Kỹ năng giải quyết vấn đề',
                      'Tư duy logic và sáng tạo'
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" />
                        <span className="text-xs text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Compact */}
            <div className="lg:col-span-1">
              <Card className="course-sidebar sticky top-4">
                <div className="relative">
                  <img
                    src={courseInfo.imageUrl}
                    alt={courseInfo.title}
                    className="h-32 w-full rounded-t-lg object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-t-lg bg-black/20">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg">
                      <Play className="h-5 w-5 fill-orange-600 text-orange-600" />
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="mb-4 text-center">
                    <div className="mb-2 text-xs text-green-600">
                      🔥 Miễn phí khi có đã mua gói
                    </div>

                    {authInfo ? (
                      isEnrolled ? (
                        <Button
                          className="w-full bg-orange-500 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                          onClick={() => router.push(`/learning/${id}`)}
                        >
                          <Play className="mr-1 h-4 w-4" />
                          Tiếp tục học
                        </Button>
                      ) : userHasPackage ? (
                        <Button
                          className="w-full bg-orange-500 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                          onClick={handleEnrollCourse}
                          disabled={isPending}
                        >
                          {isPending ? (
                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                          ) : (
                            'Ghi danh khóa học'
                          )}
                        </Button>
                      ) : (
                        <Button
                          className="buy-package-button w-full bg-orange-500 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                          onClick={() => router.push('/pricing')}
                        >
                          Mua gói học ngay
                        </Button>
                      )
                    ) : (
                      <Button
                        className="w-full bg-orange-500 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                        onClick={() => setIsLoginDialogOpen(true)}
                      >
                        Đăng ký học ngay
                      </Button>
                    )}

                    <p className="mt-2 text-xs text-gray-500">
                      Đảm bảo hoàn tiền trong 30 ngày
                    </p>
                  </div>

                  <div className="space-y-3 border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-900">
                      Khóa học bao gồm:
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-3 w-3 text-orange-600" />
                        <span>{totalLessons} bài học</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-orange-600" />
                        <span>{formatTotalDuration(totalDuration)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Video className="h-3 w-3 text-orange-600" />
                        <span>Truy cập mọi lúc</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
