import { AlertTriangle, Lock, Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AccountStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: 'banned' | 'unverified' | null;
  email?: string;
}

export default function AccountStatusDialog({ 
  open, 
  onOpenChange, 
  status, 
  email 
}: AccountStatusDialogProps) {
  
  const getStatusConfig = () => {
    switch (status) {
      case 'banned':
        return {
          icon: <Lock className="h-12 w-12 text-red-500" />,
          title: 'Tài khoản đã bị khóa',
          description: 'Tài khoản của bạn đã bị khóa và không thể đăng nhập.',
          badge: <Badge variant="destructive">Bị khóa</Badge>,
          details: [
            'Tài khoản của bạn đã bị quản trị viên khóa',
            'Bạn không thể đăng nhập vào hệ thống',
            'Tất cả phiên đăng nhập hiện tại đã bị hủy',
            'Liên hệ quản trị viên để biết thêm chi tiết'
          ],
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'unverified':
        return {
          icon: <Mail className="h-12 w-12 text-amber-500" />,
          title: 'Email chưa được xác thực',
          description: 'Bạn cần xác thực email trước khi đăng nhập.',
          badge: <Badge variant="secondary">Chưa xác thực</Badge>,
          details: [
            'Tài khoản của bạn chưa được xác thực email',
            'Kiểm tra hộp thư đến và thư rác',
            'Click vào link xác thực trong email',
            'Sau khi xác thực, bạn có thể đăng nhập bình thường'
          ],
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200'
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            {config.icon}
          </div>
          <DialogTitle className="text-xl font-semibold">
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex justify-center">
            {config.badge}
          </div>

          {/* Account Info */}
          {email && (
            <div className={`rounded-lg border p-3 ${config.bgColor} ${config.borderColor}`}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm">{email}</span>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Chi tiết:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              {config.details.map((detail, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                  {detail}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className={`rounded-lg border p-3 ${config.bgColor} ${config.borderColor}`}>
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
              <div className="text-sm">
                <p className="font-medium text-gray-900">Cần hỗ trợ?</p>
                <p className="text-gray-600">
                  Liên hệ với chúng tôi qua email: support@alevel.vn
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center pt-2">
            <Button 
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="w-full"
            >
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}