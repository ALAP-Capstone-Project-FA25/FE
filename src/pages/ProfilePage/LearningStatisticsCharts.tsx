import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetUserLearningStatistics } from '@/queries/adaptive-recommendation.query';
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

export default function LearningStatisticsCharts() {
  const { data: statistics, isLoading: isLoadingStats } =
    useGetUserLearningStatistics(true);

  if (isLoadingStats) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const stats = statistics;
  const hasData = stats && stats.totalQuizAttempts > 0;

  if (!hasData) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BarChart3 className="mx-auto h-16 w-16 text-gray-400" />
          <p className="mt-4 text-lg text-gray-500">
            Chưa có dữ liệu thống kê. Hãy làm các bài quiz để xem phân tích!
          </p>
        </CardContent>
      </Card>
    );
  }

  const scoreDistributionData = (stats.scoreDistribution || []).map((item) => ({
    name: item.range,
    count: item.count
  }));

  const quizHistoryData = (stats.attemptsByDate || []).map((item) => ({
    date: new Date(item.date).toLocaleDateString('vi-VN', {
      month: 'numeric',
      day: 'numeric'
    }),
    attempts: item.attemptCount,
    averageScore: item.averageScore
  }));

  console.log(statistics);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900">
          Phân Tích Kết Quả Học Tập
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Thống kê chi tiết về quá trình học tập
        </p>
      </div>

      {/* Statistics Overview Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Tổng số quiz</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{stats.totalQuizAttempts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">
              Điểm trung bình
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {stats.averageScore.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Câu đúng</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{stats.totalCorrectAnswers}</div>
            <p className="text-xs text-muted-foreground">
              / {stats.totalWrongAnswers + stats.totalCorrectAnswers} câu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Thời gian TB</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {stats.totalQuizAttempts > 0
                ? Math.floor(
                    stats.totalTimeSpent / stats.totalQuizAttempts / 60
                  )
                : 0}
              p
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalQuizAttempts > 0
                ? Math.floor(
                    (stats.totalTimeSpent / stats.totalQuizAttempts) % 60
                  )
                : 0}
              s
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Phân bố điểm số</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#f97316" name="Số bài quiz" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lịch sử quiz (30 ngày)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={quizHistoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" stroke="#f97316" />
                <YAxis yAxisId="right" orientation="right" stroke="#8884d8" />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="attempts"
                  fill="#fcd34d"
                  name="Số lần làm"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="averageScore"
                  stroke="#f97316"
                  name="Điểm TB (%)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Course Performance */}
      {stats.coursePerformance && stats.coursePerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hiệu suất theo khóa học</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[300px] space-y-3 overflow-y-auto">
              {stats.coursePerformance.map((course) => (
                <div key={course.courseId} className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="line-clamp-1 text-sm font-semibold">
                      {course.courseTitle}
                    </h4>
                    <span className="ml-2 whitespace-nowrap text-xs text-gray-600">
                      {course.averageScore.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mb-2 flex items-center gap-2 text-xs text-gray-600">
                    <span>{course.attemptCount} lần</span>
                    <span>•</span>
                    <span>
                      {course.correctAnswers}/{course.totalQuestions} đúng
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
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
    </div>
  );
}
