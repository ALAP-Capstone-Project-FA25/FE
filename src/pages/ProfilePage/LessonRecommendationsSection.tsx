import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type AdaptiveLessonRecommendationDto } from '@/queries/adaptive-recommendation.query';
import { useEnrollCourse } from '@/queries/course.query';
import { useRouter } from '@/routes/hooks';
import { Loader2, Star, CheckCircle2, Video, Play, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { LessonType } from '@/types/api.types';

interface LessonRecommendationsSectionProps {
  lessonRecommendations: AdaptiveLessonRecommendationDto[];
  onLessonClick: (lesson: AdaptiveLessonRecommendationDto) => void;
}

export default function LessonRecommendationsSection({
  lessonRecommendations,
  onLessonClick
}: LessonRecommendationsSectionProps) {
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

  if (lessonRecommendations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">
            Chưa có đề xuất bài học. Hãy làm các bài quiz để hệ thống phân tích
            và đề xuất bài học phù hợp với bạn.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900">
          Bài Học Được Đề Xuất
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Hệ thống đã phân tích kết quả quiz và đề xuất các bài học phù hợp
        </p>
      </div>

      <div className="max-h-[calc(100vh-150px)] space-y-4 overflow-y-auto">
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
              <CardTitle className="line-clamp-2 text-base">
                {rec.lessonTitle}
              </CardTitle>
              <p className="mt-1 text-xs text-gray-500">
                {rec.courseTitle} • {rec.topicTitle}
              </p>
            </CardHeader>
            <CardContent>
              <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                {rec.lessonDescription}
              </p>

              <div className="mb-3 space-y-1 rounded-lg bg-orange-50 p-2">
                <p className="text-xs font-medium text-orange-900">
                  {rec.recommendationReason}
                </p>
                <div className="flex items-center gap-3 text-xs text-orange-700">
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
                      className="mb-3 w-full text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>
                        {expandedLessons.has(rec.lessonId) ? 'Ẩn' : 'Xem'} chi
                        tiết ({rec.wrongQuestions.length})
                      </span>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mb-3 space-y-2 rounded-lg border border-orange-200 bg-orange-50 p-2">
                      {rec.wrongQuestions.map((wq, idx) => (
                        <div
                          key={wq.questionId}
                          className="rounded-lg border border-orange-300 bg-white p-2"
                        >
                          <div className="mb-1 flex items-start gap-2">
                            <X className="mt-0.5 h-3 w-3 flex-shrink-0 text-red-600" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-gray-900">
                                Câu {idx + 1}: {wq.questionText}
                              </p>
                              <p className="mt-0.5 text-[10px] text-gray-500">
                                {wq.courseTitle} • {wq.topicTitle}
                              </p>
                            </div>
                          </div>
                          <div className="ml-5 space-y-0.5 text-xs">
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
                    className="flex-1  bg-orange-500 text-sm text-white"
                    onClick={() => onLessonClick(rec)}
                  >
                    <Play className="mr-2 h-3 w-3" />
                    {rec.lessonType === LessonType.VIDEO ||
                    rec.lessonType === LessonType.DOCUMENT
                      ? 'Xem Bài Học'
                      : 'Xem Video'}
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 text-sm"
                      onClick={() => {
                        router.push(`/course/${rec.courseId}`);
                      }}
                    >
                      Xem Khóa Học
                    </Button>
                    <Button
                      className="flex-1 text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEnroll(rec.courseId, e);
                      }}
                      disabled={
                        isEnrolling && enrollingCourseId === rec.courseId
                      }
                    >
                      {isEnrolling && enrollingCourseId === rec.courseId ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Đang đăng ký...
                        </>
                      ) : (
                        'Đăng Ký'
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
  );
}
