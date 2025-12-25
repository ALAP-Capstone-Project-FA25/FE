import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  useGetAdaptiveCourseRecommendations,
  useGetAdaptiveLessonRecommendations,
  type AdaptiveLessonRecommendationDto
} from '@/queries/adaptive-recommendation.query';
import { useEnrollCourse } from '@/queries/course.query';
import { useRouter } from '@/routes/hooks';
import {
  Loader2,
  BookOpen,
  TrendingUp,
  Star,
  CheckCircle2,
  Video,
  Play,
  X
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import LessonViewerSheet from './LessonViewerSheet';
import { LessonType } from '@/types/api.types';

export default function AdaptiveRecommendationsPage() {
  const {
    data: lessonData,
    isLoading: isLoadingLessons,
    error: lessonError,
    refetch: refetchLessons
  } = useGetAdaptiveLessonRecommendations(true);
  const {
    data: courseData,
    isLoading: isLoadingCourses,
    error: courseError,
    refetch: refetchCourses
  } = useGetAdaptiveCourseRecommendations(true);
  const { mutateAsync: enrollCourse, isPending: isEnrolling } =
    useEnrollCourse();
  const router = useRouter();
  const { toast } = useToast();
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(
    null
  );
  const [expandedLessons, setExpandedLessons] = useState<Set<number>>(
    new Set()
  );
  const [selectedLesson, setSelectedLesson] =
    useState<AdaptiveLessonRecommendationDto | null>(null);
  const [isLessonSheetOpen, setIsLessonSheetOpen] = useState(false);

  const lessonRecommendations = lessonData || [];
  const courseRecommendations = courseData || [];
  const isLoading = isLoadingLessons || isLoadingCourses;
  const error = lessonError || courseError;

  const handleEnroll = async (courseId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setEnrollingCourseId(courseId);
    try {
      const [err] = await enrollCourse({ courseId });
      if (err) {
        toast({
          title: 'Lỗi',
          description:
            err.data?.message || 'Có lỗi xảy ra khi đăng ký khóa học',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Thành công!',
          description: 'Đăng ký khóa học thành công',
          variant: 'default'
        });
        // Refetch recommendations to update enrollment status
        refetchLessons();
        refetchCourses();
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Có lỗi xảy ra',
        variant: 'destructive'
      });
    } finally {
      setEnrollingCourseId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-orange-500" />
          <p className="mt-4 text-gray-600">
            Đang phân tích weak areas của bạn...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-600">
              Có lỗi xảy ra khi tải đề xuất. Vui lòng thử lại sau.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const toggleLessonExpanded = (lessonId: number) => {
    setExpandedLessons((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(lessonId)) {
        newSet.delete(lessonId);
      } else {
        newSet.add(lessonId);
      }
      return newSet;
    });
  };

  if (
    lessonRecommendations.length === 0 &&
    courseRecommendations.length === 0
  ) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <BookOpen className="mx-auto h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  Chưa có đề xuất
                </h3>
                <p className="mt-2 text-gray-600">
                  Hãy làm các bài quiz để hệ thống phân tích và đề xuất bài học
                  phù hợp với bạn.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Đề Xuất Bài Học Dựa Trên Weak Areas
          </h1>
          <p className="mt-2 text-gray-600">
            Hệ thống đã phân tích kết quả quiz của bạn và đề xuất các bài học
            (video) phù hợp để củng cố kiến thức
          </p>
        </div>

        {/* Lesson Recommendations - Main Focus */}
        {lessonRecommendations.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">
              Bài Học Được Đề Xuất
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {lessonRecommendations.map((rec) => (
                <Card
                  key={rec.lessonId}
                  className="group transition-all hover:shadow-lg"
                >
                  <CardHeader>
                    <div className="mb-2 flex items-center justify-between">
                      <Badge className="bg-orange-500 text-white">
                        <Video className="mr-1 h-3 w-3" />
                        Video đề xuất
                      </Badge>
                      <div className="flex items-center gap-2">
                        {rec.isEnrolled && (
                          <Badge
                            variant="outline"
                            className="border-green-500 text-green-700"
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Đã đăng ký
                          </Badge>
                        )}
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
                          <span className="text-sm font-medium">
                            {rec.recommendationScore}
                          </span>
                        </div>
                      </div>
                    </div>
                    <CardTitle className="line-clamp-2 text-lg">
                      {rec.lessonTitle}
                    </CardTitle>
                    <p className="mt-1 text-sm text-gray-500">
                      {rec.courseTitle} • {rec.topicTitle}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                      {rec.lessonDescription}
                    </p>

                    <div className="mb-4 space-y-2 rounded-lg bg-orange-50 p-3">
                      <p className="text-sm font-medium text-orange-900">
                        {rec.recommendationReason}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-orange-700">
                        <span>{rec.referralCount} câu hỏi sai</span>
                        <span>Độ thành thạo: {rec.masteryLevel}/5</span>
                      </div>
                    </div>

                    {/* Wrong Questions Details */}
                    {rec.wrongQuestions.length > 0 && (
                      <Collapsible
                        open={expandedLessons.has(rec.lessonId)}
                        onOpenChange={() => toggleLessonExpanded(rec.lessonId)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="outline"
                            className="mb-4 w-full"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="mr-2">
                              {expandedLessons.has(rec.lessonId) ? 'Ẩn' : 'Xem'}{' '}
                              chi tiết câu hỏi sai ({rec.wrongQuestions.length})
                            </span>
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="mb-4 space-y-3 rounded-lg border border-orange-200 bg-orange-50 p-3">
                            {rec.wrongQuestions.map((wq, idx) => (
                              <div
                                key={wq.questionId}
                                className="rounded-lg border border-orange-300 bg-white p-3"
                              >
                                <div className="mb-2 flex items-start gap-2">
                                  <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">
                                      Câu {idx + 1}: {wq.questionText}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                      Khóa học: {wq.courseTitle} • Topic:{' '}
                                      {wq.topicTitle}
                                    </p>
                                  </div>
                                </div>
                                <div className="ml-6 space-y-1 text-sm">
                                  <div>
                                    <span className="font-medium text-red-600">
                                      Bạn chọn:
                                    </span>{' '}
                                    <span className="text-gray-700">
                                      {wq.selectedAnswers || 'Không có'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-green-600">
                                      Đáp án đúng:
                                    </span>{' '}
                                    <span className="text-gray-700">
                                      {wq.correctAnswers}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    <div className="flex gap-2">
                      {rec.isEnrolled ? (
                        <Button
                          className="flex-1"
                          onClick={() => {
                            setSelectedLesson(rec);
                            setIsLessonSheetOpen(true);
                          }}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          {rec.lessonType === LessonType.VIDEO ||
                          rec.lessonType === LessonType.DOCUMENT
                            ? 'Xem Bài Học'
                            : 'Xem Video'}
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              router.push(`/course/${rec.courseId}`);
                            }}
                          >
                            Xem Khóa Học
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEnroll(rec.courseId, e);
                            }}
                            disabled={
                              isEnrolling && enrollingCourseId === rec.courseId
                            }
                          >
                            {isEnrolling &&
                            enrollingCourseId === rec.courseId ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang đăng ký...
                              </>
                            ) : (
                              'Đăng Ký Ngay'
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Course Recommendations - Secondary */}
        {courseRecommendations.length > 0 && (
          <div>
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">
              Khóa Học Được Đề Xuất
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courseRecommendations.map((rec) => (
                <Card
                  key={rec.courseId}
                  className="group cursor-pointer transition-all hover:shadow-lg"
                  onClick={() => router.push(`/course/${rec.courseId}`)}
                >
                  <CardHeader>
                    <div className="mb-2 flex items-center justify-between">
                      <Badge className="bg-orange-500 text-white">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        Đề xuất
                      </Badge>
                      <div className="flex items-center gap-2">
                        {rec.isEnrolled && (
                          <Badge
                            variant="outline"
                            className="border-green-500 text-green-700"
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Đã đăng ký
                          </Badge>
                        )}
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
                          <span className="text-sm font-medium">
                            {rec.recommendationScore}
                          </span>
                        </div>
                      </div>
                    </div>
                    {rec.imageUrl && (
                      <div className="mb-4 h-40 overflow-hidden rounded-lg">
                        <img
                          src={rec.imageUrl}
                          alt={rec.courseTitle}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <CardTitle className="line-clamp-2">
                      {rec.courseTitle}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                      {rec.courseDescription}
                    </p>

                    <div className="mb-4 space-y-2 rounded-lg bg-orange-50 p-3">
                      <p className="text-sm font-medium text-orange-900">
                        {rec.recommendationReason}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-orange-700">
                        <span>{rec.weakLessonCount} bài học cần củng cố</span>
                        <span>
                          Độ thành thạo TB: {rec.averageMasteryLevel.toFixed(1)}
                          /5
                        </span>
                      </div>
                    </div>

                    {rec.weakAreas.length > 0 && (
                      <div className="mb-4">
                        <p className="mb-2 text-xs font-medium text-gray-700">
                          Weak areas chính:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {rec.weakAreas.slice(0, 3).map((area) => (
                            <Badge
                              key={area.lessonId}
                              variant="outline"
                              className="text-xs"
                            >
                              {area.lessonTitle}
                            </Badge>
                          ))}
                          {rec.weakAreas.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{rec.weakAreas.length - 3} khác
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {rec.isEnrolled ? (
                        <Button
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/course/${rec.courseId}`);
                          }}
                        >
                          Xem Chi Tiết
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/course/${rec.courseId}`);
                            }}
                          >
                            Xem Chi Tiết
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={(e) => handleEnroll(rec.courseId, e)}
                            disabled={
                              isEnrolling && enrollingCourseId === rec.courseId
                            }
                          >
                            {isEnrolling &&
                            enrollingCourseId === rec.courseId ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang đăng ký...
                              </>
                            ) : (
                              'Đăng Ký Ngay'
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Lesson Viewer Sheet */}
        {selectedLesson && (
          <LessonViewerSheet
            open={isLessonSheetOpen}
            onOpenChange={setIsLessonSheetOpen}
            lessonId={selectedLesson.lessonId}
            lessonTitle={selectedLesson.lessonTitle}
            lessonType={selectedLesson.lessonType}
            lessonVideoUrl={selectedLesson.lessonVideoUrl}
            lessonDescription={selectedLesson.lessonDescription}
            courseTitle={selectedLesson.courseTitle}
            topicTitle={selectedLesson.topicTitle}
          />
        )}
      </div>
    </div>
  );
}
