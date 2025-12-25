import { Dialog, DialogContent } from '@/components/ui/dialog';
import StudentProgressViewer from './StudentProgressViewer';

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
  console.log('courseIdd', courseId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="h-[90vh] max-w-7xl gap-0 p-0">
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
