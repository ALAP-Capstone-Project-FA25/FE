import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useLogin, useRegister, useForgotPassword } from '@/queries/auth.query';
import { useDispatch } from 'react-redux';
import { login, setInfoUser } from '@/redux/auth.slice';
import __helpers from '@/helpers';
import { useToast } from '../ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import BaseRequest from '@/config/axios.config';
import { Checkbox } from '../ui/checkbox';
import { Eye, EyeOff, Lock, User as UserIcon, Mail, Phone } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import AccountStatusDialog from './AccountStatusDialog';


interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ViewMode = 'login' | 'register' | 'forgot-password';

export default function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('login');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  
  // Account status dialog
  const [accountStatusDialog, setAccountStatusDialog] = useState<{
    open: boolean;
    status: 'banned' | 'unverified' | null;
    email?: string;
  }>({
    open: false,
    status: null,
    email: undefined
  });
  
  // Register fields
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    phone: '',
    passwordHash: '',
    confirmPassword: '',
    gender: 0
  });
  
  // Forgot password field
  const [forgotEmail, setForgotEmail] = useState('');
  
  const { mutateAsync: loginMutation } = useLogin();
  const { mutateAsync: registerMutation } = useRegister();
  const { mutateAsync: forgotPasswordMutation } = useForgotPassword();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName || !password) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const [error, data] = await loginMutation({
        userName,
        password
      });

      if (error) {
        const errorMessage = error?.data?.message || error?.message || 'Tên đăng nhập hoặc mật khẩu không đúng';
        
        // Kiểm tra các trường hợp lỗi đặc biệt
        if (errorMessage.includes('User đã bị khóa') || errorMessage.includes('bị khóa')) {
          setAccountStatusDialog({
            open: true,
            status: 'banned',
            email: userName.includes('@') ? userName : undefined
          });
          return;
        }
        
        if (errorMessage.includes('Email chưa được xác nhận') || errorMessage.includes('chưa được xác thực')) {
          setAccountStatusDialog({
            open: true,
            status: 'unverified',
            email: userName.includes('@') ? userName : undefined
          });
          return;
        }
        
        // Lỗi thông thường
        toast({
          title: 'Đăng nhập thất bại',
          description: errorMessage,
          variant: 'destructive'
        });
        return;
      }

      // Lưu token vào cookie
      if (data?.accessToken) {
        const token = data?.accessToken;
        __helpers.cookie_set('AT', token, 7); // Lưu 7 ngày

        // Dispatch action để update state
        dispatch(login());

        // Nếu có thông tin user, lưu vào state
        if (data?.user) {
          dispatch(setInfoUser(data?.user));
        } else {
          // Fetch thông tin user nếu không có trong response
          try {
            const userInfo = await BaseRequest.Get('/api/Auth/get-info');
            console.log(userInfo);
            dispatch(setInfoUser(userInfo));
          } catch (err) {
            // Không ảnh hưởng đến quá trình login nếu fetch user info thất bại
            console.error('Failed to fetch user info:', err);
          }
        }

        queryClient.invalidateQueries({ queryKey: ['get-my-info'] });

        toast({
          title: 'Đăng nhập thành công',
          description: 'Chào mừng bạn trở lại!'
        });
        window.location.reload();
        onOpenChange(false);
        setUserName('');
        setPassword('');
      } else {
        toast({
          title: 'Đăng nhập thất bại',
          description: 'Không nhận được token từ server',
          variant: 'destructive'
        });
      }
    } catch (err: any) {
      toast({
        title: 'Đăng nhập thất bại',
        description: err?.message || 'Đã xảy ra lỗi khi đăng nhập',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!registerData.userName || !registerData.email || !registerData.passwordHash) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        variant: 'destructive'
      });
      return;
    }

    if (registerData.passwordHash !== registerData.confirmPassword) {
      toast({
        title: 'Lỗi',
        description: 'Mật khẩu xác nhận không khớp',
        variant: 'destructive'
      });
      return;
    }

    if (registerData.passwordHash.length < 6) {
      toast({
        title: 'Lỗi',
        description: 'Mật khẩu phải có ít nhất 6 ký tự',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const [error] = await registerMutation({
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        userName: registerData.userName,
        email: registerData.email,
        phone: registerData.phone,
        passwordHash: registerData.passwordHash,
        gender: registerData.gender
      });

      if (error) {
        toast({
          title: 'Đăng ký thất bại',
          description: error?.data?.message || 'Đã xảy ra lỗi khi đăng ký',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Đăng ký thành công! 🎉',
        description: 'Vui lòng kiểm tra email để xác thực tài khoản'
      });

      // Reset form và chuyển về login
      setRegisterData({
        firstName: '',
        lastName: '',
        userName: '',
        email: '',
        phone: '',
        passwordHash: '',
        confirmPassword: '',
        gender: 0
      });
      setViewMode('login');
    } catch (err: any) {
      toast({
        title: 'Đăng ký thất bại',
        description: err?.message || 'Đã xảy ra lỗi khi đăng ký',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotEmail) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập email',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const [error] = await forgotPasswordMutation(forgotEmail);

      if (error) {
        toast({
          title: 'Lỗi',
          description: error?.data?.message || 'Không tìm thấy email',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Thành công! 📧',
        description: 'Vui lòng kiểm tra email để đặt lại mật khẩu'
      });

      setForgotEmail('');
      setViewMode('login');
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

  const prefersReduced = useReducedMotion();

  const popIn = {
    initial: { scale: 0.6, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.96, opacity: 0 }
  };

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        // delayChildren giúp content “nở” xong mới stagger các phần tử
        delayChildren: 0.05,
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: prefersReduced ? 0 : 6, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.24 } }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-0 p-0 shadow-2xl sm:max-w-[900px]">
        {/* Dùng AnimatePresence để có animate on appear; key giúp re-mount khi open thay đổi */}
        <AnimatePresence mode="wait">
          {open && (
            <motion.div
              key="login-pop"
              variants={popIn}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={
                prefersReduced
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 420, damping: 26, mass: 0.7 }
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Left panel - branding (CAM) */}
                <motion.div
                  className="relative hidden md:block"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  {/* Gradient orange */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-400/80" />
                  {/* Glow patterns */}
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-25"
                    style={{
                      background:
                        'radial-gradient(1100px 380px at -10% -10%, rgba(255,255,255,0.25), transparent 60%), radial-gradient(800px 300px at 110% 110%, rgba(255,255,255,0.22), transparent 60%)'
                    }}
                  />
                  <div className="relative h-full px-8 py-10 text-white">
                    <div className="flex h-full flex-col">
                      <motion.div variants={itemVariants}>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
                          <span className="inline-block h-2 w-2 rounded-full bg-white" />
                          A Level Adaptive Learning
                        </span>
                        <h2 className="mt-4 text-3xl font-bold leading-tight">
                          Học tốt hơn, nhanh hơn
                        </h2>
                        <p className="mt-2 max-w-sm text-white/85">
                          Nền tảng học thích ứng với lộ trình cá nhân hoá và
                          mentor đồng hành.
                        </p>
                      </motion.div>

                      <ul className="mt-8 space-y-3 text-sm text-white/90">
                        {[
                          'Truy cập khoá học trả phí',
                          'Nhận góp ý trực tiếp từ mentor',
                          'Lộ trình học cá nhân hoá'
                        ].map((txt) => (
                          <motion.li
                            key={txt}
                            className="flex items-start gap-3"
                            variants={itemVariants}
                          >
                            <span className="mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                              <svg
                                viewBox="0 0 24 24"
                                className="h-3.5 w-3.5"
                                fill="none"
                              >
                                <path
                                  d="M20 7L9 18l-5-5"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                            {txt}
                          </motion.li>
                        ))}
                      </ul>

                      <motion.div
                        className="mt-auto pt-10 text-xs text-white/75"
                        variants={itemVariants}
                      >
                        © {new Date().getFullYear()} A Level. All rights
                        reserved.
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Right panel - form */}
                <motion.div
                  className="relative"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  {/* Subtle orange accents */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_200px_at_100%_0,rgba(249,115,22,0.08),transparent),radial-gradient(600px_200px_at_0_100%,rgba(251,146,60,0.08),transparent)]"
                  />
                  <div className="relative px-6 pb-6 pt-6 sm:px-8 sm:pt-8">
                    <DialogHeader className="mb-1">
                      <motion.div variants={itemVariants}>
                        <DialogTitle className="text-2xl">
                          {viewMode === 'login' && 'Chào mừng trở lại 👋'}
                          {viewMode === 'register' && 'Đăng ký tài khoản 🎓'}
                          {viewMode === 'forgot-password' && 'Quên mật khẩu? 🔐'}
                        </DialogTitle>
                        <DialogDescription>
                          {viewMode === 'login' && 'Đăng nhập để tiếp tục học với A Level Adaptive Learning'}
                          {viewMode === 'register' && 'Tạo tài khoản mới để bắt đầu hành trình học tập'}
                          {viewMode === 'forgot-password' && 'Nhập email để nhận link đặt lại mật khẩu'}
                        </DialogDescription>
                      </motion.div>
                    </DialogHeader>

                    {viewMode === 'login' && (
                      <form onSubmit={handleLogin} className="mt-4">
                      <div className="grid gap-4">
                        <motion.div
                          className="grid gap-2"
                          variants={itemVariants}
                        >
                          <Label htmlFor="userName">Tên đăng nhập</Label>
                          <div className="relative">
                            <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="userName"
                              value={userName}
                              onChange={(e) => setUserName(e.target.value)}
                              placeholder="Nhập tên đăng nhập"
                              disabled={isLoading}
                              autoComplete="username"
                              className="pl-9 focus-visible:ring-2 focus-visible:ring-orange-500"
                            />
                          </div>
                        </motion.div>

                        <motion.div
                          className="grid gap-2"
                          variants={itemVariants}
                        >
                          <Label htmlFor="password">Mật khẩu</Label>
                          <div className="relative">
                            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="password"
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Nhập mật khẩu"
                              disabled={isLoading}
                              autoComplete="current-password"
                              className="pl-9 pr-10 focus-visible:ring-2 focus-visible:ring-orange-500"
                            />
                            <button
                              type="button"
                              aria-label={
                                showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'
                              }
                              onClick={() => setShowPassword((v) => !v)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-accent"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </motion.div>

                        <motion.div
                          className="flex items-center justify-between"
                          variants={itemVariants}
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="remember"
                              checked={remember}
                              onCheckedChange={(v) => setRemember(Boolean(v))}
                              disabled={isLoading}
                            />
                            <Label
                              htmlFor="remember"
                              className="text-sm text-muted-foreground"
                            >
                              Ghi nhớ đăng nhập
                            </Label>
                          </div>
                          <button
                            type="button"
                            className="text-sm font-medium text-orange-700 underline-offset-4 hover:underline"
                            onClick={() => setViewMode('forgot-password')}
                          >
                            Quên mật khẩu?
                          </button>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <Button
                            type="submit"
                            disabled={isLoading}
                            className="h-10 w-full rounded-lg bg-orange-600 text-white hover:bg-orange-700 focus-visible:ring-2 focus-visible:ring-orange-500"
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
                                Đang đăng nhập...
                              </span>
                            ) : (
                              'Đăng nhập'
                            )}
                          </Button>
                        </motion.div>

                        <motion.div
                          className="text-center text-sm"
                          variants={itemVariants}
                        >
                          <span className="text-muted-foreground">Chưa có tài khoản? </span>
                          <button
                            type="button"
                            className="font-medium text-orange-700 underline-offset-4 hover:underline"
                            onClick={() => setViewMode('register')}
                          >
                            Đăng ký ngay
                          </button>
                        </motion.div>

                        <motion.div
                          className="text-center text-xs text-muted-foreground"
                          variants={itemVariants}
                        >
                          Bằng việc đăng nhập, bạn đồng ý với Điều khoản và
                          Chính sách bảo mật
                        </motion.div>
                      </div>

                      <DialogFooter className="hidden" />
                    </form>
                    )}

                    {viewMode === 'register' && (
                      <form onSubmit={handleRegister} className="mt-4">
                        <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-2">
                          <motion.div className="grid grid-cols-2 gap-3" variants={itemVariants}>
                            <div className="grid gap-2">
                              <Label htmlFor="firstName">Họ</Label>
                              <Input
                                id="firstName"
                                value={registerData.firstName}
                                onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                                placeholder="Nguyễn"
                                disabled={isLoading}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="lastName">Tên</Label>
                              <Input
                                id="lastName"
                                value={registerData.lastName}
                                onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                                placeholder="Văn A"
                                disabled={isLoading}
                              />
                            </div>
                          </motion.div>

                          <motion.div className="grid gap-2" variants={itemVariants}>
                            <Label htmlFor="regUserName">Tên đăng nhập *</Label>
                            <div className="relative">
                              <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="regUserName"
                                value={registerData.userName}
                                onChange={(e) => setRegisterData({ ...registerData, userName: e.target.value })}
                                placeholder="username"
                                disabled={isLoading}
                                required
                                className="pl-9"
                              />
                            </div>
                          </motion.div>

                          <motion.div className="grid gap-2" variants={itemVariants}>
                            <Label htmlFor="email">Email *</Label>
                            <div className="relative">
                              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="email"
                                type="email"
                                value={registerData.email}
                                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                placeholder="email@example.com"
                                disabled={isLoading}
                                required
                                className="pl-9"
                              />
                            </div>
                          </motion.div>

                          <motion.div className="grid gap-2" variants={itemVariants}>
                            <Label htmlFor="phone">Số điện thoại</Label>
                            <div className="relative">
                              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="phone"
                                value={registerData.phone}
                                onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                                placeholder="0123456789"
                                disabled={isLoading}
                                className="pl-9"
                              />
                            </div>
                          </motion.div>

                        

                          <motion.div className="grid gap-2" variants={itemVariants}>
                            <Label htmlFor="regPassword">Mật khẩu *</Label>
                            <div className="relative">
                              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="regPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={registerData.passwordHash}
                                onChange={(e) => setRegisterData({ ...registerData, passwordHash: e.target.value })}
                                placeholder="Ít nhất 6 ký tự"
                                disabled={isLoading}
                                required
                                className="pl-9 pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-accent"
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </motion.div>

                          <motion.div className="grid gap-2" variants={itemVariants}>
                            <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                            <div className="relative">
                              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={registerData.confirmPassword}
                                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                                placeholder="Nhập lại mật khẩu"
                                disabled={isLoading}
                                required
                                className="pl-9"
                              />
                            </div>
                          </motion.div>

                          <motion.div variants={itemVariants}>
                            <Button
                              type="submit"
                              disabled={isLoading}
                              className="h-10 w-full rounded-lg bg-orange-600 text-white hover:bg-orange-700"
                            >
                              {isLoading ? (
                                <span className="inline-flex items-center gap-2">
                                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                  </svg>
                                  Đang đăng ký...
                                </span>
                              ) : (
                                'Đăng ký'
                              )}
                            </Button>
                          </motion.div>

                          <motion.div className="text-center text-sm" variants={itemVariants}>
                            <span className="text-muted-foreground">Đã có tài khoản? </span>
                            <button
                              type="button"
                              className="font-medium text-orange-700 underline-offset-4 hover:underline"
                              onClick={() => setViewMode('login')}
                            >
                              Đăng nhập
                            </button>
                          </motion.div>
                        </div>
                      </form>
                    )}

                    {viewMode === 'forgot-password' && (
                      <form onSubmit={handleForgotPassword} className="mt-4">
                        <div className="grid gap-4">
                          <motion.div className="grid gap-2" variants={itemVariants}>
                            <Label htmlFor="forgotEmail">Email</Label>
                            <div className="relative">
                              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="forgotEmail"
                                type="email"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                placeholder="email@example.com"
                                disabled={isLoading}
                                required
                                className="pl-9"
                              />
                            </div>
                          </motion.div>

                          <motion.div variants={itemVariants}>
                            <Button
                              type="submit"
                              disabled={isLoading}
                              className="h-10 w-full rounded-lg bg-orange-600 text-white hover:bg-orange-700"
                            >
                              {isLoading ? (
                                <span className="inline-flex items-center gap-2">
                                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                  </svg>
                                  Đang gửi...
                                </span>
                              ) : (
                                'Gửi link đặt lại mật khẩu'
                              )}
                            </Button>
                          </motion.div>

                          <motion.div className="text-center text-sm" variants={itemVariants}>
                            <button
                              type="button"
                              className="font-medium text-orange-700 underline-offset-4 hover:underline"
                              onClick={() => setViewMode('login')}
                            >
                              ← Quay lại đăng nhập
                            </button>
                          </motion.div>
                        </div>
                      </form>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
      
      {/* Account Status Dialog */}
      <AccountStatusDialog
        open={accountStatusDialog.open}
        onOpenChange={(open) => setAccountStatusDialog(prev => ({ ...prev, open }))}
        status={accountStatusDialog.status}
        email={accountStatusDialog.email}
      />
    </Dialog>
  );
}
