import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, TrendingUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseProgressButtonProps {
  courseTitle: string;
  studentId: number;
  courseId: number;
  studentName: string;
  onClick: () => void;
  isLoading?: boolean;
  className?: string;
}

export default function CourseProgressButton({
  courseTitle,
  studentId,
  courseId,
  studentName,
  onClick,
  isLoading = false,
  className
}: CourseProgressButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        'group relative h-auto flex-col items-start gap-1 border-blue-200 bg-blue-50/50 p-2 text-left transition-all duration-200 hover:border-blue-300 hover:bg-blue-100',
        isLoading && 'cursor-not-allowed opacity-50',
        className
      )}
      title={`Xem tiến độ học tập của ${studentName} trong khóa ${courseTitle}`}
    >
      <div className="flex w-full items-center gap-2">
        <div className="rounded-md bg-blue-100 p-1 transition-colors group-hover:bg-blue-200">
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
          ) : (
            <TrendingUp className="h-3 w-3 text-blue-600" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3 text-blue-500" />
            <span className="text-xs font-medium text-blue-700 group-hover:text-blue-800">
              Xem tiến độ
            </span>
          </div>
        </div>
      </div>

      <Badge
        variant="secondary"
        className="w-full justify-start truncate border-0 bg-blue-100/70 text-xs text-blue-700 group-hover:bg-blue-200/70"
      >
        {courseTitle}
      </Badge>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
    </Button>
  );
}
