import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useResetPassword } from '@/queries/auth.query';
import { Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutateAsync: resetPasswordMutation } = useResetPassword();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      toast({
        title: 'Lỗi',
        description: 'Link không hợp lệ',
        variant: 'destructive'
      });
      navigate('/');
    }
  }, [searchParams, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Lỗi',
        description: 'Mật khẩu xác nhận không khớp',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Lỗi',
        description: 'Mật khẩu phải có ít nhất 6 ký tự',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const [error] = await resetPasswordMutation({
        token,
        newPassword
      });

      if (error) {
        toast({
          title: 'Đặt lại mật khẩu thất bại',
          description: error?.data?.message || 'Link đã hết hạn hoặc không hợp lệ',
          variant: 'destructive'
        });
        return;
      }

      setIsSuccess(true);
      toast({
        title: 'Thành công! 🎉',
        description: 'Mật khẩu đã được đặt lại'
      });

      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err: any) {
      toast({
        title: 'Lỗi',
        description: err?.message || 'Đã xảy ra lỗi',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-xl">
          <div className="mb-4 flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Đặt lại mật khẩu thành công!
          </h1>
          <p className="mb-6 text-gray-600">
            Bạn sẽ được chuyển về trang chủ trong giây lát...
          </p>
          <Button
            onClick={() => navigate('/')}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            Về trang chủ ngay
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-orange-100 p-3">
              <Lock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Đặt lại mật khẩu
          </h1>
          <p className="text-sm text-gray-600">
            Nhập mật khẩu mới cho tài khoản của bạn
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Mật khẩu mới</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ít nhất 6 ký tự"
                disabled={isLoading}
                required
                className="pl-9 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:bg-gray-100"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                disabled={isLoading}
                required
                className="pl-9"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    d="M4 12a8 8 0 018-8"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
                Đang xử lý...
              </span>
            ) : (
              'Đặt lại mật khẩu'
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm text-orange-700 underline-offset-4 hover:underline"
            >
              ← Quay lại trang chủ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
