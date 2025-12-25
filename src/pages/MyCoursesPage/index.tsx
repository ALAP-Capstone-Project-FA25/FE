import { useGetMyCourses } from '@/queries/course.query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Play,
  Search,
  Filter,
  Loader2,
  GraduationCap,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from '@/routes/hooks';
import __helpers from '@/helpers';
import { Input } from '@/components/ui/input';

type CourseStatus = 'all' | 'in-progress' | 'completed';

export default function MyCoursesPage() {
  const { data, isLoading, refetch } = useGetMyCourses();
  const router = useRouter();

  const [selectedStatus, setSelectedStatus] = useState<CourseStatus>('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  const courses: any[] = (data as any)?.data || [];

  const getStatusCount = (status: CourseStatus) => {
    if (status === 'all') return courses.length;
    if (status === 'completed')
      return courses.filter((course) => course.isDone).length;
    if (status === 'in-progress')
      return courses.filter((course) => !course.isDone).length;
    return 0;
  };

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter((userCourse) => {
      const course = userCourse.course || {};
      const title = course.title || userCourse.title || '';
      const description = course.description || userCourse.description || '';

      const keywordMatch =
        !searchKeyword ||
        title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        description.toLowerCase().includes(searchKeyword.toLowerCase());

      const statusMatch =
        selectedStatus === 'all' ||
        (selectedStatus === 'completed' && userCourse.isDone) ||
        (selectedStatus === 'in-progress' && !userCourse.isDone);

      return keywordMatch && statusMatch;
    });
  }, [courses, searchKeyword, selectedStatus]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex h-[60vh] items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-orange-500" />
              <p className="text-lg text-slate-600">Đang tải khóa học của bạn...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-orange-500 p-2">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800">
              Khóa học của tôi
            </h1>
          </div>
          <p className="text-slate-600 ml-12">
            Quản lý và theo dõi tiến độ học tập của bạn
          </p>
        </div>

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Filters */}
          <div className="w-full lg:w-[280px] space-y-4 flex-shrink-0">
            {/* Search */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Search className="h-5 w-5 text-orange-500" />
                  Tìm kiếm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Tìm kiếm khóa học..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* Status Filter */}
            <Card className="border-none shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Filter className="h-5 w-5 text-orange-500" />
                  Trạng thái
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button
                  onClick={() => setSelectedStatus('all')}
                  className={cn(
                    'w-full rounded-lg px-4 py-3 text-left transition-all duration-200',
                    selectedStatus === 'all'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Tất cả</span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        selectedStatus === 'all'
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-700'
                      )}
                    >
                      {getStatusCount('all')}
                    </Badge>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedStatus('in-progress')}
                  className={cn(
                    'w-full rounded-lg px-4 py-3 text-left transition-all duration-200',
                    selectedStatus === 'in-progress'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Đang học</span>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        selectedStatus === 'in-progress'
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-700'
                      )}
                    >
                      {getStatusCount('in-progress')}
                    </Badge>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedStatus('completed')}
                  className={cn(
                    'w-full rounded-lg px-4 py-3 text-left transition-all duration-200',
                    selectedStatus === 'completed'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="font-medium">Đã hoàn thành</span>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        selectedStatus === 'completed'
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-700'
                      )}
                    >
                      {getStatusCount('completed')}
                    </Badge>
                  </div>
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Content - Main */}
          <div className="flex-1">
            {filteredCourses.length === 0 ? (
              <Card className="border-none shadow-lg">
                <CardContent className="flex h-96 flex-col items-center justify-center">
                  <div className="mb-4 rounded-full bg-orange-100 p-6">
                    <BookOpen className="h-16 w-16 text-orange-500" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-slate-800">
                    {courses.length === 0
                      ? 'Chưa có khóa học nào'
                      : 'Không tìm thấy khóa học'}
                  </h3>
                  <p className="text-center text-slate-600">
                    {courses.length === 0
                      ? 'Hãy đăng ký khóa học để bắt đầu học tập'
                      : 'Không có khóa học nào phù hợp với bộ lọc hiện tại'}
                  </p>
                  {courses.length === 0 && (
                    <Button
                      className="mt-4 bg-orange-500 text-white hover:bg-orange-600"
                      onClick={() => router.push('/')}
                    >
                      Khám phá khóa học
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-600">
                    Hiển thị <span className="text-orange-500 font-semibold">{filteredCourses.length}</span> khóa học
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredCourses.map((userCourse) => {
                    const course = userCourse.course || {};
                    const courseId = userCourse.courseId || course.id;
                    const courseTitle = course.title || userCourse.title || 'Khóa học';
                    const courseDescription = course.description || userCourse.description || '';
                    const courseImageUrl = course.imageUrl || '';
                    const progressPercent = userCourse.progressPercent || 0;
                    const isDone = userCourse.isDone || false;

                    return (
                      <Card
                        key={userCourse.id || courseId}
                        className="group relative overflow-hidden border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-orange-300"
                      >
                        {/* Course Image/Icon Header */}
                        <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50">
                          {courseImageUrl ? (
                            <img
                              src={courseImageUrl}
                              alt={courseTitle}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <GraduationCap className="h-20 w-20 text-orange-200" />
                            </div>
                          )}
                          
                          {/* Status Badge */}
                          <div className="absolute left-3 top-3">
                            {isDone ? (
                              <Badge className="border-none bg-emerald-500 text-white shadow-lg">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Hoàn thành
                              </Badge>
                            ) : (
                              <Badge className="border-none bg-orange-500 text-white shadow-lg">
                                <Clock className="mr-1 h-3 w-3" />
                                Đang học
                              </Badge>
                            )}
                          </div>

                          {/* Progress Bar Overlay */}
                          {!isDone && progressPercent > 0 && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200">
                              <div
                                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Course Content */}
                        <CardHeader className="pb-3">
                          <CardTitle className="line-clamp-2 text-lg text-slate-800 group-hover:text-orange-600 transition-colors">
                            {courseTitle}
                          </CardTitle>
                          <CardDescription className="line-clamp-2 text-sm mt-1">
                            {courseDescription}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {/* Progress Info */}
                          {!isDone && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600 flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  Tiến độ
                                </span>
                                <span className="font-semibold text-orange-600">
                                  {Math.round(progressPercent)}%
                                </span>
                              </div>
                              <Progress 
                                value={progressPercent} 
                                className="h-2"
                              />
                            </div>
                          )}

                          {isDone && (
                            <div className="rounded-lg bg-emerald-50 p-3 border border-emerald-200">
                              <div className="flex items-center gap-2 text-emerald-700">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-sm font-medium">Đã hoàn thành khóa học</span>
                              </div>
                            </div>
                          )}

                          {/* Course Meta */}
                          <div className="space-y-2 pt-2 border-t border-slate-100">
                            {course.categoryName && (
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Badge variant="outline" className="text-xs">
                                  {course.categoryName}
                                </Badge>
                              </div>
                            )}
                            {userCourse.createdAt && (
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  Đăng ký: {__helpers.convertToDate(userCourse.createdAt)}
                                </span>
                              </div>
                            )}
                            {userCourse.currentLessonId > 0 && !isDone && (
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <BookOpen className="h-3 w-3" />
                                <span>Đang học bài {userCourse.currentLessonId}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            {!isDone ? (
                              <Button
                                className="flex-1 bg-orange-500 text-white hover:bg-orange-600"
                                onClick={() => router.push(`/learning/${courseId}`)}
                              >
                                <Play className="mr-2 h-4 w-4" />
                                Tiếp tục
                              </Button>
                            ) : (
                              <Button
                                className="flex-1 bg-emerald-500 text-white hover:bg-emerald-600"
                                onClick={() => router.push(`/course/${courseId}`)}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Xem lại
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="icon"
                              className="border-slate-300"
                              onClick={() => router.push(`/course/${courseId}`)}
                              title="Xem chi tiết"
                            >
                              <BookOpen className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

