import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  CreditCard,
  Building2,
  User,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import __helpers from '@/helpers';
import {
  useGetRefundInfo,
  useSubmitRefundInfo
} from '@/queries/event-ticket.query';

// Danh sách ngân hàng phổ biến ở Việt Nam
const BANKS = [
  'Vietcombank',
  'BIDV',
  'Vietinbank',
  'Agribank',
  'Techcombank',
  'ACB',
  'VPBank',
  'TPBank',
  'MBBank',
  'Sacombank',
  'HDBank',
  'SHB',
  'Eximbank',
  'MSB',
  'VIB',
  'SeABank',
  'OCB',
  'PVcomBank',
  'VietABank',
  'BacABank',
  'NamABank',
  'ABBank',
  'SCB',
  'DongABank',
  'GPBank',
  'LienVietPostBank',
  'KienLongBank',
  'NCB',
  'PGBank',
  'PublicBank',
  'Khác'
];

export default function RefundInfoPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Sử dụng query hook để fetch refund info
  const {
    data: refundInfo,
    isLoading: isFetching,
    error: fetchError
  } = useGetRefundInfo(ticketId);

  // Mutation hook để submit refund info
  const { mutateAsync: submitRefundInfo, isPending: isSubmitting } =
    useSubmitRefundInfo();

  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountHolderName, setBankAccountHolderName] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [isOtherBank, setIsOtherBank] = useState(false);

  // Cập nhật form fields khi data được load
  useEffect(() => {
    if (refundInfo) {
      setBankAccountNumber(refundInfo.bankAccountNumber || '');
      const savedBankName = refundInfo.bankName || '';
      setBankName(savedBankName);

      // Kiểm tra xem bankName có trong danh sách không
      if (savedBankName && BANKS.includes(savedBankName)) {
        setSelectedBank(savedBankName);
        setIsOtherBank(false);
      } else if (savedBankName) {
        setSelectedBank('Khác');
        setIsOtherBank(true);
      }

      setBankAccountHolderName(refundInfo.bankAccountHolderName || '');
    }
  }, [refundInfo]);

  // Xử lý khi chọn ngân hàng
  const handleBankChange = (value: string) => {
    setSelectedBank(value);
    if (value === 'Khác') {
      setIsOtherBank(true);
      setBankName('');
    } else {
      setIsOtherBank(false);
      setBankName(value);
    }
  };

  // Xử lý lỗi khi fetch
  useEffect(() => {
    if (fetchError) {
      toast({
        title: 'Lỗi',
        description: (fetchError as any)?.message || 'Không thể tải thông tin',
        variant: 'destructive'
      });
      // navigate('/');
    }
  }, [fetchError, navigate, toast]);

  // Kiểm tra ticketId hợp lệ
  useEffect(() => {
    if (!ticketId) {
      toast({
        title: 'Lỗi',
        description: 'Link không hợp lệ',
        variant: 'destructive'
      });
      // navigate('/');
    }
  }, [ticketId, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bankAccountNumber || !bankName || !bankAccountHolderName) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin',
        variant: 'destructive'
      });
      return;
    }

    if (!ticketId) {
      toast({
        title: 'Lỗi',
        description: 'Link không hợp lệ',
        variant: 'destructive'
      });
      return;
    }

    try {
      await submitRefundInfo({
        ticketId: Number(ticketId),
        bankAccountNumber,
        bankName,
        bankAccountHolderName
      });

      setIsSuccess(true);
      toast({
        title: 'Thành công! 🎉',
        description: 'Thông tin hoàn tiền đã được gửi thành công'
      });

      setTimeout(() => {
        // navigate('/');
      }, 3000);
    } catch (err: any) {
      toast({
        title: 'Gửi thông tin thất bại',
        description: err?.message || 'Đã xảy ra lỗi',
        variant: 'destructive'
      });
    }
  };

  if (isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-orange-600" />
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!refundInfo) {
    return null;
  }

  if (refundInfo.isRefunded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Đã hoàn tiền</CardTitle>
            <CardDescription>
              Vé này đã được hoàn tiền. Vui lòng kiểm tra email để xem chi tiết.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Về trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">
              Gửi thông tin thành công!
            </CardTitle>
            <CardDescription>
              Chúng tôi đã nhận được thông tin tài khoản của bạn. Chúng tôi sẽ
              tiến hành hoàn tiền trong thời gian sớm nhất.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Về trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-orange-100 p-3">
              <CreditCard className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">
            Nhập thông tin hoàn tiền
          </CardTitle>
          <CardDescription className="text-center">
            Vui lòng cung cấp thông tin tài khoản ngân hàng để chúng tôi có thể
            hoàn tiền cho bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Event Info */}
          <div className="mb-6 rounded-lg border border-orange-200 bg-orange-50 p-4">
            <h3 className="mb-2 font-semibold text-gray-900">
              Thông tin sự kiện
            </h3>
            <p className="text-sm text-gray-700">
              <strong>Sự kiện:</strong> {refundInfo.eventTitle}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Số tiền hoàn lại:</strong>{' '}
              <span className="font-semibold text-orange-600">
                {__helpers.formatCurrency(refundInfo.amount)} đ
              </span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankAccountNumber">
                Số tài khoản ngân hàng *
              </Label>
              <div className="relative">
                <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="bankAccountNumber"
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="Nhập số tài khoản"
                  disabled={isSubmitting}
                  required
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankName">Tên ngân hàng *</Label>
              <div className="space-y-2">
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Select
                    value={selectedBank}
                    onValueChange={handleBankChange}
                    disabled={isSubmitting}
                    required
                  >
                    <SelectTrigger className="pl-9">
                      <SelectValue placeholder="Chọn ngân hàng" />
                    </SelectTrigger>
                    <SelectContent>
                      {BANKS.map((bank) => (
                        <SelectItem key={bank} value={bank}>
                          {bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {isOtherBank && (
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="bankName"
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Nhập tên ngân hàng khác"
                      disabled={isSubmitting}
                      required
                      className="pl-9"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankAccountHolderName">Tên chủ tài khoản *</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="bankAccountHolderName"
                  type="text"
                  value={bankAccountHolderName}
                  onChange={(e) => setBankAccountHolderName(e.target.value)}
                  placeholder="Nhập tên chủ tài khoản"
                  disabled={isSubmitting}
                  required
                  className="pl-9"
                />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang gửi...
                </span>
              ) : (
                'Gửi thông tin'
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
        </CardContent>
      </Card>
    </div>
  );
}
