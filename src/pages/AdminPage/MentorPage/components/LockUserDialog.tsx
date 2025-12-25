import { useState } from 'react';
import { Lock, Unlock, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useUpdateLockUser } from '@/queries/user.query';
import { toast } from '@/components/ui/use-toast';

interface LockUserDialogProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LockUserDialog({
  user,
  isOpen,
  onClose,
  onSuccess
}: LockUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { mutateAsync: updateLockUser } = useUpdateLockUser();

  if (!user) return null;

  const isActive = user.isActive;
  const action = isActive ? 'khóa' : 'mở khóa';
  const actionTitle = isActive
    ? 'Khóa tài khoản mentor'
    : 'Mở khóa tài khoản mentor';

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const [err] = await updateLockUser({
        id: user.id,
        isActive: isActive // Pass current isActive status
      });

      if (err) {
        toast({
          title: 'Lỗi',
          description:
            err.message || `Có lỗi xảy ra khi ${action} tài khoản mentor`,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Thành công!',
          description: `Đã ${action} tài khoản mentor ${user.username} thành công`,
          variant: 'default'
        });
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: `Có lỗi xảy ra khi ${action} tài khoản mentor`,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isActive ? (
              <Lock className="h-5 w-5 text-red-600" />
            ) : (
              <Unlock className="h-5 w-5 text-green-600" />
            )}
            {actionTitle}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">
                  Bạn có chắc chắn muốn {action} tài khoản mentor này không?
                </span>
              </div>

              {/* User Info */}
              <div className="space-y-2 rounded-lg border bg-gray-50 p-4">
                <div className="flex items-center gap-2">
                  <img
                    src={
                      user.avatar ||
                      'https://avatars.githubusercontent.com/u/0?v=4'
                    }
                    alt={user.username}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">
                      {[user.firstName, user.lastName]
                        .filter(Boolean)
                        .join(' ') || user.username}
                    </p>
                    <p className="text-sm text-gray-600">@{user.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm">{user.email}</span>
                  <Badge
                    variant={user.emailConfirmed ? 'default' : 'secondary'}
                  >
                    {user.emailConfirmed ? 'Đã xác minh' : 'Chưa xác minh'}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Trạng thái hiện tại:
                  </span>
                  <Badge variant={isActive ? 'default' : 'destructive'}>
                    {isActive ? 'Hoạt động' : 'Bị khóa'}
                  </Badge>
                </div>
              </div>

              {/* Warning Messages */}
              {isActive ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-800">
                    <strong>Lưu ý:</strong> Sau khi khóa, mentor sẽ không thể
                    đăng nhập vào hệ thống. Tất cả phiên đăng nhập hiện tại sẽ
                    bị hủy và không thể thực hiện các hoạt động mentoring.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                  <p className="text-sm text-green-800">
                    <strong>Lưu ý:</strong> Sau khi mở khóa, mentor sẽ có thể
                    đăng nhập trở lại và tiếp tục hoạt động mentoring.
                    {!user.emailConfirmed &&
                      ' Tuy nhiên, tài khoản vẫn cần xác thực email để sử dụng đầy đủ tính năng.'}
                  </p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={`${
              isActive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang xử lý...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {isActive ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <Unlock className="h-4 w-4" />
                )}
                {actionTitle}
              </span>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
