import { useState, useEffect } from 'react';
import {
  Play,
  ChevronDown,
  ChevronRight,
  Clock,
  BookOpen,
  BarChart3,
  Video,
  CheckCircle2,
  Award,
  Users,
  Star,
  Loader2
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
      content: 'Danh sách tất cả các chương và bài học trong khóa học. Bạn có thể mở rộng để xem chi tiết.',
      title: 'Nội dung khóa học',
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '.course-sidebar',
      content: 'Khu vực này chứa nút đăng ký khóa học và thông tin chi tiết về khóa học.',
      title: 'Đăng ký khóa học',
      placement: 'left',
    },
    {
      target: '.buy-package-button',
      content: 'Mua gói học ngay giúp bạn có thể học toàn bộ các khóa học được cung cấp bởi hệ thống.',
      title: 'Mua gói học ngay',
      placement: 'top',
    },
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

      <div className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="course-header lg:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <Badge className="border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100">
                  <Award className="mr-1 h-3 w-3" />
                  Khóa học phổ biến
                </Badge>
                <Badge
                  variant="outline"
                  className="border-gray-200 text-gray-700"
                >
                  <Star className="mr-1 h-3 w-3 fill-orange-400 text-orange-400" />
                  4.8 (1,234 đánh giá)
                </Badge>
              </div>

              <h1 className="mb-4 text-3xl font-bold text-gray-900 lg:text-5xl">
                {courseInfo.title}
              </h1>

              <p className="mb-6 text-base leading-relaxed text-gray-600">
                {courseInfo.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-orange-50 p-2">
                    <Users className="h-4 w-4 text-orange-600" />
                  </div>
                  <span>2,456 học viên</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-orange-50 p-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                  <span>{formatTotalDuration(totalDuration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-orange-50 p-2">
                    <BookOpen className="h-4 w-4 text-orange-600" />
                  </div>
                  <span>{totalLessons} bài học</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-orange-50 p-2">
                    <BarChart3 className="h-4 w-4 text-orange-600" />
                  </div>
                  <span>Cơ bản đến nâng cao</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="course-content overflow-hidden border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Nội dung khóa học
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                      {courseData.length} chương • {totalLessons} bài học •{' '}
                      {formatTotalDuration(totalDuration)} video
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAllSections}
                    className="border-orange-200 text-orange-600 hover:bg-orange-50"
                  >
                    {expandedSections.length === courseData.length
                      ? 'Thu gọn'
                      : 'Mở rộng'}
                  </Button>
                </div>

                <div className="space-y-3">
                  {courseData.map((topic, topicIndex) => (
                    <div
                      key={topic.id}
                      className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-orange-300 hover:shadow-md"
                    >
                      <div
                        className="flex cursor-pointer items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50 p-5 transition-colors hover:from-orange-100 hover:to-amber-100"
                        onClick={() => toggleSection(topic.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md">
                            <span className="text-sm font-bold">
                              {topicIndex + 1}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">
                              {topic.title}
                            </span>
                            <span className="text-xs text-gray-500">
                              {topic.lessons?.length || 0} bài học
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {expandedSections.includes(topic.id) ? (
                            <ChevronDown className="h-5 w-5 text-orange-600 transition-transform" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-400 transition-transform" />
                          )}
                        </div>
                      </div>

                      {expandedSections.includes(topic.id) &&
                        topic.lessons?.length > 0 && (
                          <div className="border-t border-gray-100 bg-white">
                            {topic.lessons.map((lesson, lessonIndex) => (
                              <div
                                key={lesson.id}
                                className="group flex items-center justify-between border-b border-gray-50 p-4 transition-all last:border-b-0 hover:bg-orange-50/50"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 transition-all group-hover:from-orange-200 group-hover:to-amber-200">
                                    <Play className="h-4 w-4 fill-orange-600 text-orange-600" />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-800 group-hover:text-orange-700">
                                      {lessonIndex + 1}. {lesson.title}
                                    </span>
                                    {lesson.description && (
                                      <span className="mt-0.5 text-xs text-gray-500">
                                        {lesson.description}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {lesson.isFree && (
                                    <Badge
                                      variant="outline"
                                      className="border-green-300 bg-green-50 text-xs font-medium text-green-700"
                                    >
                                      Miễn phí
                                    </Badge>
                                  )}
                                  <span className="flex items-center gap-1 text-sm text-gray-500">
                                    <Clock className="h-3.5 w-3.5" />
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

            <Card className="course-benefits mt-8 border-0 shadow-xl">
              <CardContent className="p-8">
                <h3 className="mb-6 text-2xl font-bold text-gray-900">
                  Bạn sẽ học được gì?
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    'Nắm vững kiến thức nền tảng',
                    'Thực hành qua dự án thực tế',
                    'Kỹ năng giải quyết vấn đề',
                    'Tư duy logic và sáng tạo',
                    'Làm việc nhóm hiệu quả'
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="course-sidebar sticky top-8 hidden overflow-hidden border-2 border-orange-200 shadow-2xl lg:block">
              <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <img
                  src={courseInfo.imageUrl}
                  alt={courseInfo.title}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-xl">
                    <Play className="h-8 w-8 fill-orange-600 text-orange-600" />
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="mb-6 text-center">
                  {/* Ẩn phần hiển thị giá */}
                  {/* <div className="mb-1 text-sm text-gray-500 line-through">
                    {__helpers.formatCurrency(
                      courseInfo.originalPrice || courseInfo.salePrice * 1.5
                    )}{' '}
                    đ
                  </div>
                  <div className="mb-1 text-4xl font-bold text-orange-600">
                    {__helpers.formatCurrency(courseInfo.salePrice)} đ
                  </div> */}
                  <div className="mb-4 text-xs text-green-600">
                    🔥 Miễn phí khi có đã mua gói
                  </div>

                  {authInfo ? (
                    isEnrolled ? (
                      <Button
                        className="w-full rounded-lg bg-orange-500 py-6 text-base font-semibold text-white shadow-md transition-all hover:bg-orange-600 hover:shadow-lg"
                        onClick={() => router.push(`/learning/${id}`)}
                      >
                        <Play className="mr-2 h-5 w-5" />
                        Tiếp tục học
                      </Button>
                    ) : userHasPackage ? (
                      <Button
                        className="w-full rounded-lg bg-orange-500 py-6 text-base font-semibold text-white shadow-md transition-all hover:bg-orange-600 hover:shadow-lg"
                        onClick={handleEnrollCourse}
                        disabled={isPending}
                      >
                        {isPending ? (
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                          'Ghi danh khóa học'
                        )}
                      </Button>
                    ) : (
                      <Button
                        className="buy-package-button w-full rounded-lg bg-orange-500 py-6 text-base font-semibold text-white shadow-md transition-all hover:bg-orange-600 hover:shadow-lg"
                        onClick={() => router.push('/pricing')}
                      >
                        Mua gói học ngay
                      </Button>
                    )
                  ) : (
                    <Button
                      className="w-full rounded-lg bg-orange-500 py-6 text-base font-semibold text-white shadow-md transition-all hover:bg-orange-600 hover:shadow-lg"
                      onClick={() => setIsLoginDialogOpen(true)}
                    >
                      Đăng ký học ngay
                    </Button>
                  )}

                  <p className="mt-3 text-xs text-gray-500">
                    Đảm bảo hoàn tiền trong 30 ngày
                  </p>
                </div>

                <div className="space-y-4 border-t pt-6">
                  <h4 className="font-semibold text-gray-900">
                    Khóa học bao gồm:
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                      <BookOpen className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {totalLessons} bài học
                      </div>
                      <div className="text-xs text-gray-500">
                        Video HD chất lượng cao
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {formatTotalDuration(totalDuration)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Nội dung video chất lượng
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                      <Video className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        Truy cập mọi lúc
                      </div>
                      <div className="text-xs text-gray-500">
                        Trên mọi thiết bị
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
    </>
  );
}
