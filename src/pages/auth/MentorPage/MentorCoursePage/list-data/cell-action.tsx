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
import { Eye, Users, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface UserCourse {
  userId: number;
  courseId: number;
  isActive: boolean;
  isDone: boolean;
  completedAt: string | null;
  paymentId: number | null;
  title: string;
  description: string;
  userTopics: any[];
  id: number;
  createdAt: string;
  updatedAt: string;
}

interface CellActionProps {
  data: {
    id: number;
    userCourses: UserCourse[];
  };
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleViewDetails = () => {
    navigate(`/admin/courses/${data.id}/topics`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === '0001-01-01T00:00:00') return 'Chưa có';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const totalUsers = data.userCourses?.length || 0;
  const completedUsers =
    data.userCourses?.filter((uc) => uc.isDone).length || 0;
  const activeUsers = data.userCourses?.filter((uc) => uc.isActive).length || 0;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleViewDetails}
        className="flex items-center gap-2 bg-green-600 text-white"
      >
        <Eye className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="relative flex items-center gap-2 border-orange-200 bg-orange-50 text-orange-700 transition-colors hover:bg-orange-100 hover:text-orange-800"
          >
            <Users className="h-4 w-4" />
            {totalUsers > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-semibold text-white shadow-sm">
                {totalUsers}
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[80vh] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-gray-800">
              <Users className="h-6 w-6 text-orange-500" />
              Danh sách người học
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Tổng số:{' '}
              <span className="font-semibold text-orange-600">
                {totalUsers}
              </span>{' '}
              người
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px] pr-4">
            {totalUsers === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Users className="mb-3 h-16 w-16 opacity-30" />
                <p className="text-sm">Chưa có người học nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.userCourses.map((userCourse, index) => (
                  <div
                    key={userCourse.id}
                    className="group rounded-lg border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-orange-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 font-semibold text-white shadow-sm">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 transition-colors group-hover:text-orange-600">
                              Học viên: user
                            </h4>
                          </div>
                        </div>

                        <div className="ml-12 flex flex-wrap gap-2">
                          {userCourse.isActive ? (
                            <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                              <Clock className="mr-1 h-3 w-3" />
                              Đang học
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-gray-300 text-gray-600"
                            >
                              <Clock className="mr-1 h-3 w-3" />
                              Chưa kích hoạt
                            </Badge>
                          )}

                          {userCourse.isDone ? (
                            <Badge className="border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-200">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Hoàn thành
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-gray-300 text-gray-600"
                            >
                              Chưa hoàn thành
                            </Badge>
                          )}
                        </div>

                        <div className="ml-12 space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-xs">Đăng ký:</span>
                            <span className="font-medium text-gray-700">
                              {formatDate(userCourse.createdAt)}
                            </span>
                          </div>
                          {userCourse.completedAt && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
                              <span className="text-xs">Hoàn thành:</span>
                              <span className="font-medium text-gray-700">
                                {formatDate(userCourse.completedAt)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                        onClick={() => {
                          // Navigate to user details or do something
                          console.log('View user:', userCourse.userId);
                        }}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};
