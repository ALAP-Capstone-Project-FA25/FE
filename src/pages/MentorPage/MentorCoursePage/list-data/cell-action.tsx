import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Eye,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useGetUserCourseByCourseId } from '@/queries/use-course.query';
import StudentProgressDialog from '@/components/mentor/StudentProgressDialog';

interface UserData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatar: string;
}

interface UserCourseDetail {
  userId: number;
  courseId: number;
  isActive: boolean;
  isDone: boolean;
  completedAt: string | null;
  paymentId: number | null;
  title: string;
  currentTopicId: number;
  currentLessonId: number;
  progressPercent: number;
  description: string;
  id: number;
  createdAt: string;
  updatedAt: string;
  user: UserData;
}

interface CellActionProps {
  data: any; // Course data with id, title, userCourses, etc.
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{
    userId: number;
    name: string;
  } | null>(null);
  const { data: userCourseData } = useGetUserCourseByCourseId(data.id);

  // Reset progress dialog when main dialog closes
  const handleMainDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setShowProgressDialog(false);
      setSelectedStudent(null);
    }
  };

  const handleViewDetails = () => {
    navigate(`/admin/courses/${data.id}/topics`);
  };

 

  const totalUsers = userCourseData?.length || 0;
  const completedUsers =
    userCourseData?.filter((uc: UserCourseDetail) => uc.isDone).length || 0;
  const activeUsers =
    userCourseData?.filter((uc: UserCourseDetail) => uc.isActive).length || 0;
  const averageProgress =
    totalUsers > 0
      ? Math.round(
          userCourseData.reduce(
            (sum: number, uc: UserCourseDetail) =>
              sum + (uc.progressPercent || 0),
            0
          ) / totalUsers
        )
      : 0;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleViewDetails}
        className="flex items-center gap-2 border-emerald-200 bg-emerald-50 text-emerald-700 transition-all hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-sm"
      >
        <Eye className="h-4 w-4" />
        <span className="hidden sm:inline">Chi tiết</span>
      </Button>

      <Dialog open={open} onOpenChange={handleMainDialogChange}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="relative flex items-center gap-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 transition-all hover:border-orange-300 hover:from-orange-100 hover:to-amber-100 hover:shadow-md"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Học viên</span>
            {totalUsers > 0 && (
              <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-[11px] font-bold text-white shadow-lg ring-2 ring-white">
                {totalUsers}
              </span>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-h-[85vh] max-w-3xl">
          {/* Header đơn giản */}
          <div className="border-b pb-5">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-gray-800">
                <div className="rounded-lg bg-orange-50 p-2">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                Danh sách học viên
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-gray-500">
                Quản lý và theo dõi tiến độ học tập của học viên
              </DialogDescription>
            </DialogHeader>

            {/* Stats Cards - đơn giản hơn */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <div className="text-xs font-medium text-gray-500">Tổng số</div>
                <div className="mt-1 text-xl font-bold text-gray-900">
                  {totalUsers}
                </div>
              </div>
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                <div className="text-xs font-medium text-emerald-600">
                  Đang học
                </div>
                <div className="mt-1 text-xl font-bold text-emerald-700">
                  {activeUsers}
                </div>
              </div>
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                <div className="text-xs font-medium text-blue-600">
                  Hoàn thành
                </div>
                <div className="mt-1 text-xl font-bold text-blue-700">
                  {completedUsers}
                </div>
              </div>
              <div className="rounded-lg border border-orange-100 bg-orange-50 p-3">
                <div className="text-xs font-medium text-orange-600">
                  TB tiến độ
                </div>
                <div className="mt-1 text-xl font-bold text-orange-700">
                  {averageProgress}%
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <ScrollArea className="h-[450px] pr-4 pt-5">
              {totalUsers === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <div className="rounded-full bg-gray-50 p-6">
                    <Users className="h-16 w-16 text-gray-300" />
                  </div>
                  <p className="mt-4 text-base font-medium text-gray-500">
                    Chưa có học viên nào
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    Danh sách học viên sẽ hiển thị ở đây
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userCourseData?.map(
                    (userCourse: UserCourseDetail, index: number) => (
                      <div
                        key={userCourse.id}
                        className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 transition-all duration-300 hover:border-orange-200 hover:shadow-lg"
                      >
                        {/* Gradient accent */}
                        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-orange-400 to-amber-400 opacity-0 transition-opacity group-hover:opacity-100" />

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          {/* User Info */}
                          <div className="flex flex-1 gap-3">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                              {userCourse.user.avatar ? (
                                <img
                                  src={userCourse.user.avatar}
                                  alt={userCourse.user.username}
                                  className="h-14 w-14 rounded-full border-2 border-orange-100 object-cover shadow-md ring-2 ring-white transition-transform group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-orange-100 bg-gradient-to-br from-orange-100 to-amber-100 shadow-md ring-2 ring-white transition-transform group-hover:scale-105">
                                  <User className="h-6 w-6 text-orange-600" />
                                </div>
                              )}
                              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-[10px] font-bold text-white shadow-md ring-2 ring-white">
                                {index + 1}
                              </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 space-y-2">
                              <div>
                                <h4 className="text-base font-semibold text-gray-800 transition-colors group-hover:text-orange-600">
                                  {userCourse.user.firstName}{' '}
                                  {userCourse.user.lastName}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  @{userCourse.user.username}
                                </p>
                              </div>

                              {/* Progress Bar */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-medium text-gray-600">
                                    Tiến độ học tập
                                  </span>
                                  <span className="font-bold text-orange-600">
                                    {userCourse.progressPercent}%
                                  </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-400 transition-all duration-500"
                                    style={{
                                      width: `${userCourse.progressPercent}%`
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Badges */}
                              <div className="flex flex-wrap gap-2">
                                {userCourse.isActive ? (
                                  <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                                    <Clock className="mr-1 h-3 w-3" />
                                    Đang học
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="border-gray-300 bg-gray-50 text-gray-600"
                                  >
                                    <Clock className="mr-1 h-3 w-3" />
                                    Chưa kích hoạt
                                  </Badge>
                                )}

                                {userCourse.isDone ? (
                                  <Badge className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100">
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    Hoàn thành
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="border-amber-200 bg-amber-50 text-amber-700"
                                  >
                                    <TrendingUp className="mr-1 h-3 w-3" />
                                    Đang thực hiện
                                  </Badge>
                                )}
                              </div>

                            </div>
                          </div>

                          
                         
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Student Progress Dialog */}
      <StudentProgressDialog
        open={showProgressDialog}
        onOpenChange={(isOpen) => {
          setShowProgressDialog(isOpen);
          if (!isOpen) {
            // Reset selected student and reopen main dialog
            setSelectedStudent(null);
            setTimeout(() => setOpen(true), 100);
          }
        }}
        userId={selectedStudent?.userId || 0}
        courseId={data.id}
        studentName={selectedStudent?.name || ''}
        courseName={data.title || 'Khóa học'}
      />
    </div>
  );
};
