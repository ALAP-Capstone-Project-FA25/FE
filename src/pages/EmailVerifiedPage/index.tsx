import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function EmailVerifiedPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'success' | 'error'>('success');

  useEffect(() => {
    // Check if there's an error in URL params
    const params = new URLSearchParams(window.location.search);
    if (params.get('error')) {
      setStatus('error');
    }
  }, []);

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-xl">
          <div className="mb-4 flex justify-center">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Xác thực thất bại
          </h1>
          <p className="mb-6 text-gray-600">
            Link xác thực không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.
          </p>
          <Button
            onClick={() => navigate('/')}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-xl">
        <div className="mb-4 flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Xác thực email thành công! 🎉
        </h1>
        <p className="mb-6 text-gray-600">
          Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập và bắt đầu
          học ngay bây giờ.
        </p>
        <Button
          onClick={() => navigate('/')}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          Đăng nhập ngay
        </Button>
      </div>
    </div>
  );
}
