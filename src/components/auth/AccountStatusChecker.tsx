import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { logout } from '@/redux/auth.slice';
import { useGetMyInfoOnce } from '@/queries/user.query';
import AccountStatusDialog from './AccountStatusDialog';
import __helpers from '@/helpers';

export default function AccountStatusChecker() {
  const dispatch = useDispatch();
  const { infoUser } = useSelector((state: RootState) => state.auth);
  const hasToken = !!__helpers.cookie_get('AT');
  
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    status: 'banned' | 'unverified' | null;
    email?: string;
  }>({
    open: false,
    status: null,
    email: undefined
  });

  // Fetch user info if logged in but don't have user info
  const { error } = useGetMyInfoOnce();

  useEffect(() => {
    // Chỉ kiểm tra khi có token và có thông tin user
    if (!hasToken || !infoUser) return;

    // Kiểm tra tài khoản bị khóa
    if (infoUser.isActive === false) {
      setStatusDialog({
        open: true,
        status: 'banned',
        email: infoUser.email
      });
      return;
    }

    // Kiểm tra email chưa xác thực (tùy chọn - có thể bỏ qua cho một số tính năng)
    // if (infoUser.emailConfirmed === false) {
    //   setStatusDialog({
    //     open: true,
    //     status: 'unverified',
    //     email: infoUser.email
    //   });
    //   return;
    // }
  }, [hasToken, infoUser]);

  // Xử lý lỗi khi fetch user info
  useEffect(() => {
    if (error && hasToken) {
      const errorMessage = (error as any)?.message || '';
      
      if (errorMessage.includes('User đã bị khóa') || errorMessage.includes('bị khóa')) {
        setStatusDialog({
          open: true,
          status: 'banned',
          email: undefined
        });
      } else if (errorMessage.includes('Email chưa được xác nhận')) {
        setStatusDialog({
          open: true,
          status: 'unverified',
          email: undefined
        });
      }
    }
  }, [error, hasToken]);

  const handleStatusDialogClose = () => {
    setStatusDialog(prev => ({ ...prev, open: false }));
    
    // Nếu tài khoản bị khóa, đăng xuất user
    if (statusDialog.status === 'banned') {
      dispatch(logout());
    }
  };

  return (
    <AccountStatusDialog
      open={statusDialog.open}
      onOpenChange={handleStatusDialogClose}
      status={statusDialog.status}
      email={statusDialog.email}
    />
  );
}