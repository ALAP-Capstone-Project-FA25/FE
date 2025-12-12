import { useGetCurrentLesson } from '@/queries/student-progress.query';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Video, FileText, Play, Loader2 } from 'lucide-react';

interface CurrentLessonBadgeProps {
  userId: number;
  courseId: number;
}

export default function CurrentLessonBadge({
  userId,
  courseId
}: CurrentLessonBadgeProps) {
  const { data, isPending } = useGetCurrentLesson(userId, courseId);

  if (isPending) {
    return (
      <Badge variant="outline" className="gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="text-xs">Đang tải...</span>
      </Badge>
    );
  }

  if (!data?.isEnrolled || !data?.hasStarted) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Play className="h-3 w-3" />
        <span className="text-xs">Chưa bắt đầu</span>
      </Badge>
    );
  }

  const lesson = data.currentLesson;
  const isVideo = lesson.lessonType === 1;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className="gap-1 border-blue-200 bg-blue-50 text-blue-700"
          >
            {isVideo ? (
              <Video className="h-3 w-3" />
            ) : (
              <FileText className="h-3 w-3" />
            )}
            <span className="max-w-[150px] truncate text-xs">
              {lesson.lessonTitle}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{lesson.lessonTitle}</p>
            <p className="text-xs text-gray-500">
              Chủ đề: {lesson.topicTitle}
            </p>
            <p className="text-xs text-gray-500">
              Tiến độ: {Math.round(data.progressPercent || 0)}%
            </p>
            {isVideo && lesson.videoUrl && (
              <a
                href={lesson.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="block text-xs text-blue-600 hover:underline"
              >
                🔗 Xem video
              </a>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
