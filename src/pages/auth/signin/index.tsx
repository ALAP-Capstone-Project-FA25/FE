'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Shield,
  Users,
  BookOpen,
  Star
} from 'lucide-react';
import { useLogin } from '@/queries/auth.query';
import __helpers from '@/helpers';
import { toast } from '@/components/ui/use-toast';

export default function AdminLoginPage() {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { mutateAsync: login } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const model = {
      username: userName,
      password: password
    };
    const [err, res] = await login(model);
    console.log(res);
    if (!err) {
      const token = res.accessToken;
      __helpers.cookie_set('AT', token);
      window.location.href = '/admin/dashboard';
    } else {
      toast({
        title: 'Đăng nhập thất bại',
        description: 'Tên đăng nhập hoặc mật khẩu không đúng',
        variant: 'destructive'
      });
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      {/* Enhanced Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute right-0 top-0 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 blur-3xl"></div>
        <div className="animation-delay-1000 absolute bottom-0 left-0 h-96 w-96 animate-pulse rounded-full bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 blur-3xl"></div>
        <div className="animation-delay-2000 absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-r from-cyan-400/10 to-blue-600/10 blur-2xl"></div>

        {/* Floating geometric shapes */}
        <div className="animation-delay-500 absolute left-20 top-20 h-4 w-4 animate-bounce rounded-full bg-blue-400/30"></div>
        <div className="animation-delay-1000 absolute right-32 top-40 h-6 w-6 animate-bounce rounded-full bg-purple-400/30"></div>
        <div className="animation-delay-1500 absolute bottom-32 left-32 h-3 w-3 animate-bounce rounded-full bg-indigo-400/30"></div>
        <div className="animation-delay-2000 absolute bottom-20 right-20 h-5 w-5 animate-bounce rounded-full bg-cyan-400/30"></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex w-full max-w-6xl items-center gap-12">
        {/* Left Side - Branding & Info */}
        <div className="hidden flex-col justify-center space-y-8 lg:flex lg:flex-1">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  ALAP Learning
                </h2>
                <p className="text-sm text-gray-600">
                  Hệ thống quản lý học tập
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-gray-900">
                Chào mừng đến với
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  ALAP Learning
                </span>
              </h3>
              <p className="text-lg text-gray-600">
                Nền tảng học tập trực tuyến hiện đại với công nghệ tiên tiến
              </p>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-white/50 p-4 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">10,000+</p>
                  <p className="text-xs text-gray-600">Học viên</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white/50 p-4 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">500+</p>
                  <p className="text-xs text-gray-600">Khóa học</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white/50 p-4 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                  <Star className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">4.9/5</p>
                  <p className="text-xs text-gray-600">Đánh giá</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white/50 p-4 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                  <Shield className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">100%</p>
                  <p className="text-xs text-gray-600">Bảo mật</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <Card className="w-full max-w-md border-0 bg-white/90 shadow-2xl backdrop-blur-lg">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900">
                Đăng Nhập Quản Trị
              </h1>
              <p className="text-sm text-gray-600">
                Truy cập bảng điều khiển quản lý của bạn
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="text-sm font-semibold text-gray-700"
                >
                  Tên Đăng Nhập
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="admin"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="h-12 border-gray-200 bg-gray-50 pl-12 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-700"
                >
                  Mật Khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 border-gray-200 bg-gray-50 pl-12 pr-12 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                  <div className="flex items-center space-x-2">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-red-100">
                      <span className="text-xs">!</span>
                    </div>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Đang xử lý...
                  </div>
                ) : (
                  'Đăng Nhập'
                )}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="mt-8 space-y-4 border-t border-gray-200 pt-6 text-center">
              <div>
                <a
                  href="#"
                  className="text-sm text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                >
                  Quên mật khẩu?
                </a>
              </div>
              <div className="text-sm text-gray-600">
                Cần hỗ trợ?{' '}
                <a
                  href="#"
                  className="text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                >
                  Liên hệ hỗ trợ
                </a>
              </div>
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 px-8 pb-6 text-xs text-gray-500">
            <Shield className="h-3 w-3" />
            <span>Kết nối được bảo mật với SSL</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
