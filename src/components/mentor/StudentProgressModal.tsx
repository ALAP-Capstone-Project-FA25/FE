import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import StudentProgressViewer from './StudentProgressViewer';
import { useQueryClient } from '@tanstack/react-query';

interface StudentProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number;
  courseId: number;
  studentName: string;
  courseName: string;
  onBackToChat: () => void;
}

export default function StudentProgressModal({
  isOpen,
  onClose,
  studentId,
  courseId,
  studentName,
  courseName,
  onBackToChat
}: StudentProgressModalProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  console.log('courseIdd', courseId);
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Force refresh by invalidating queries
    queryClient.invalidateQueries({
      queryKey: ['mentor-student-progress', studentId, courseId]
    });
    queryClient.invalidateQueries({
      queryKey: ['mentor-student-notes']
    });
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleBackToChat = () => {
    onBackToChat();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="h-[90vh] max-w-7xl gap-0 p-0">
        {/* Header with toolbar */}
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToChat}
              className="flex items-center gap-2 hover:bg-blue-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại chat
            </Button>

            <div className="h-6 w-px bg-gray-300" />

            <div>
              <DialogTitle className="text-lg font-semibold text-gray-800">
                Tiến độ học tập - {studentName}
              </DialogTitle>
              <p className="mt-1 text-sm text-gray-600">
                Khóa học: {courseName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
              />
              Làm mới
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Progress viewer content */}
        <div className="flex-1 overflow-hidden">
          <StudentProgressViewer
            studentId={studentId}
            courseId={courseId}
            isReadOnly={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
