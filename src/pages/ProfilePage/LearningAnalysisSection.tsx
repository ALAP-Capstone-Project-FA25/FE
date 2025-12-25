import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useGetUserLearningStatistics,
  useGetAdaptiveLessonRecommendations,
  useGetAdaptiveCourseRecommendations
} from '@/queries/adaptive-recommendation.query';
import { Loader2, TrendingUp, BarChart3, Target, Clock } from 'lucide-react';
import {
  BarChart,
  Bar,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useState } from 'react';
import LessonViewerSheet from '@/pages/AdaptiveRecommendations/LessonViewerSheet';
import type { AdaptiveLessonRecommendationDto } from '@/queries/adaptive-recommendation.query';
import AdaptiveRecommendationsContent from './AdaptiveRecommendationsContent';

export default function LearningAnalysisSection() {
  const { data: statistics, isLoading: isLoadingStats } =
    useGetUserLearningStatistics(true);
  const { data: lessonRecommendations, isLoading: isLoadingLessons } =
    useGetAdaptiveLessonRecommendations(true);
  const { data: courseRecommendations, isLoading: isLoadingCourses } =
    useGetAdaptiveCourseRecommendations(true);

  const [selectedLesson, setSelectedLesson] =
    useState<AdaptiveLessonRecommendationDto | null>(null);
  const [isLessonSheetOpen, setIsLessonSheetOpen] = useState(false);

  if (isLoadingStats || isLoadingLessons || isLoadingCourses) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }


  const stats = statistics;
  const hasData = stats && stats.totalQuizAttempts > 0;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Phân Tích Kết Quả Học Tập
        </h2>
        <p className="mt-2 text-gray-600">
          Thống kê chi tiết về quá trình học tập và đề xuất cải thiện
        </p>
      </div>

      {!hasData ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="mx-auto h-16 w-16 text-gray-400" />
            <p className="mt-4 text-lg text-gray-500">
              Chưa có dữ liệu thống kê. Hãy làm các bài quiz để xem phân tích!
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Statistics Overview Cards */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng số lần làm quiz
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalQuizAttempts}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Điểm trung bình
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.averageScore.toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Câu đúng / Tổng câu
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalCorrectAnswers} / {stats.totalQuestionsAnswered}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tỷ lệ:{' '}
                  {stats.totalQuestionsAnswered > 0
                    ? (
                        (stats.totalCorrectAnswers /
                          stats.totalQuestionsAnswered) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng thời gian học
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.floor(stats.totalTimeSpent / 60)} phút
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalTimeSpent % 60} giây
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Phân Bố Điểm Số</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Attempts Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Lịch Sử Làm Quiz (30 ngày gần nhất)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={stats.attemptsByDate}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="attemptCount"
                      fill="#f97316"
                      name="Số lần làm"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="averageScore"
                      stroke="#3b82f6"
                      name="Điểm TB (%)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Course Performance */}
          {stats.coursePerformance.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Hiệu Suất Theo Khóa Học</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.coursePerformance.map((course) => (
                    <div
                      key={course.courseId}
                      className="rounded-lg border p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-semibold">{course.courseTitle}</h4>
                        <span className="text-sm text-gray-600">
                          {course.averageScore.toFixed(1)}% TB
                        </span>
                      </div>
                      <div className="mb-2 flex items-center gap-4 text-sm text-gray-600">
                        <span>{course.attemptCount} lần làm</span>
                        <span>
                          {course.correctAnswers} / {course.totalQuestions} câu
                          đúng
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-orange-500 transition-all"
                          style={{
                            width: `${course.averageScore}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Adaptive Recommendations */}
          <AdaptiveRecommendationsContent
            lessonRecommendations={lessonRecommendations || []}
            courseRecommendations={courseRecommendations || []}
            onLessonClick={(lesson) => {
              setSelectedLesson(lesson);
              setIsLessonSheetOpen(true);
            }}
          />
        </>
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
    </section>
  );
}
