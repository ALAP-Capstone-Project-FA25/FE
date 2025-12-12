import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useGetStudentProgress } from '@/queries/student-progress.query';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BookOpen,
  CheckCircle,
  Clock,
  TrendingUp,
  Loader2,
  Video,
  FileText
} from 'lucide-react';

interface StudentProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  courseId: number;
  studentName: string;
  courseName: string;
}

export default function StudentProgressDialog({
  open,
  onOpenChange,
  userId,
  courseId,
  studentName,
  courseName
}: StudentProgressDialogProps) {
  const { data, isPending, isError, error } = useGetStudentProgress(userId, courseId);

  const topics = data?.listObjects || [];
  const totalLessons = topics.reduce(
    (sum: number, topic: any) => sum + (topic.lessons?.length || 0),
    0
  );
  const completedLessons = topics.reduce(
    (sum: number, topic: any) =>
      sum +
      (topic.lessons?.filter((l: any) => l.isDone).length || 0),
    0
  );
  const progressPercent =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Tiến độ học tập - {studentName}
          </DialogTitle>
          <p className="text-sm text-gray-500">{courseName}</p>
        </DialogHeader>

        {isPending ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : isError ? (
          <div className="py-12 text-center">
            <BookOpen className="mx-auto mb-3 h-12 w-12 text-red-400" />
            <p className="text-red-600">Không thể tải dữ liệu tiến độ</p>
            <p className="mt-2 text-sm text-gray-500">
              {error instanceof Error ? error.message : 'Vui lòng thử lại sau'}
            </p>
          </div>
        ) : topics.length === 0 ? (
          <div className="py-12 text-center">
            <BookOpen className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            <p className="text-gray-600">Học viên chưa có tiến độ học tập</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Progress */}
            <div className="rounded-lg border bg-gradient-to-r from-blue-50 to-cyan-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  Tiến độ tổng quan
                </h3>
                <Badge variant="secondary" className="text-lg font-bold">
                  {Math.round(progressPercent)}%
                </Badge>
              </div>
              <Progress value={progressPercent} className="mb-2 h-3" />
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  {completedLessons} / {totalLessons} bài học
                </span>
              </div>
            </div>

            {/* Topics Progress */}
            <div>
              <h3 className="mb-3 font-semibold text-gray-900">
                Tiến độ theo chủ đề
              </h3>
              <ScrollArea className="max-h-[500px]">
                <div className="space-y-4">
                  {topics.map((topic: any, index: number) => {
                    const topicLessons = topic.lessons || [];
                    const topicCompleted = topicLessons.filter(
                      (l: any) => l.isDone
                    ).length;
                    const topicProgress =
                      topicLessons.length > 0
                        ? (topicCompleted / topicLessons.length) * 100
                        : 0;

                    return (
                      <div
                        key={topic.id}
                        className="rounded-lg border bg-white p-4"
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {topic.title}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {topicCompleted} / {topicLessons.length} bài học
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              topicProgress === 100 ? 'default' : 'secondary'
                            }
                          >
                            {Math.round(topicProgress)}%
                          </Badge>
                        </div>
                        <Progress value={topicProgress} className="mb-3 h-2" />

                        {/* Lessons List */}
                        <div className="space-y-2">
                          {topicLessons.map((lesson: any, lessonIndex: number) => (
                            <div
                              key={lesson.id}
                              className={`flex items-center gap-2 rounded-md p-2 text-sm ${
                                lesson.isDone
                                  ? 'bg-green-50 text-green-900'
                                  : lesson.isCurrent
                                    ? 'bg-blue-50 text-blue-900'
                                    : 'bg-gray-50 text-gray-600'
                              }`}
                            >
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-semibold">
                                {lessonIndex + 1}
                              </span>
                              {lesson.lessonType === 1 ? (
                                <Video className="h-4 w-4" />
                              ) : (
                                <FileText className="h-4 w-4" />
                              )}
                              <span className="flex-1">{lesson.title}</span>
                              {lesson.isDone && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                              {lesson.isCurrent && !lesson.isDone && (
                                <Clock className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
