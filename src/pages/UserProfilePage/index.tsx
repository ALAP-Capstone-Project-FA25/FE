'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useGetMyInfo, useUpdateMyProfile } from '@/queries/user.query';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { USER_ROLE } from '@/constants/data';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  Shield,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function UserProfilePage() {
  const { isLoading } = useGetMyInfo();
  const updateProfileMutation = useUpdateMyProfile();
  const infoUser = useSelector((state: RootState) => state.auth.infoUser);
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    bio: ''
  });

  const getRoleName = (role: number) => {
    switch (role) {
      case USER_ROLE.ADMIN:
        return 'Quản trị viên';
      case USER_ROLE.MENTOR:
        return 'Mentor';
      case USER_ROLE.USER:
        return 'Học viên';
      case USER_ROLE.SPEAKER:
        return 'Diễn giả';
      default:
        return 'Người dùng';
    }
  };

  const getRoleIcon = (role: number) => {
    switch (role) {
      case USER_ROLE.ADMIN:
        return <Shield className="h-4 w-4" />;
      case USER_ROLE.MENTOR:
        return <GraduationCap className="h-4 w-4" />;
      case USER_ROLE.SPEAKER:
        return <Briefcase className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: number) => {
    switch (role) {
      case USER_ROLE.ADMIN:
        return 'bg-red-100 text-red-800 border-red-200';
      case USER_ROLE.MENTOR:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case USER_ROLE.SPEAKER:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Combine firstName and lastName to fullName
  const getFullName = () => {
    if (infoUser?.firstName || infoUser?.lastName) {
      return `${infoUser?.firstName || ''} ${infoUser?.lastName || ''}`.trim();
    }
    return infoUser?.username || infoUser?.userName || 'Người dùng';
  };

  const handleEdit = () => {
    // Combine firstName and lastName for editing
    const fullName = getFullName();
    setFormData({
      fullName: fullName,
      email: infoUser?.email || '',
      phone: infoUser?.phone || '',
      address: infoUser?.address || '',
      bio: infoUser?.bio || ''
    });
    setIsEditing(true);
  };

  // Initialize formData when infoUser is loaded
  useEffect(() => {
    if (infoUser && !isEditing) {
      const firstName = infoUser?.firstName || '';
      const lastName = infoUser?.lastName || '';
      const fullName =
        firstName || lastName
          ? `${firstName} ${lastName}`.trim()
          : infoUser?.username || infoUser?.userName || '';

      setFormData({
        fullName: fullName,
        email: infoUser?.email || '',
        phone: infoUser?.phone || '',
        address: infoUser?.address || '',
        bio: infoUser?.bio || ''
      });
    }
  }, [infoUser, isEditing]);

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync(formData);
      toast({
        title: 'Thành công',
        description: 'Cập nhật thông tin thành công!',
        variant: 'default'
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error?.message || 'Có lỗi xảy ra khi cập nhật thông tin',
        variant: 'destructive'
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      bio: ''
    });
  };

  if (isLoading || !infoUser) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
            <p className="text-gray-600">Đang tải thông tin...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Thông tin tài khoản
        </h1>
        <p className="mt-2 text-gray-600">Quản lý thông tin cá nhân của bạn</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-4 text-center">
              <div className="mb-4 flex justify-center">
                <Avatar className="h-24 w-24 border-4 border-orange-100">
                  <AvatarImage
                    src={infoUser?.avatar || ''}
                    alt={infoUser?.username || infoUser?.userName || ''}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-orange-200 to-orange-400 text-2xl font-bold text-white">
                    {getInitials(getFullName())}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{getFullName()}</CardTitle>
              <Badge
                variant="outline"
                className={`mt-2 ${getRoleBadgeColor(infoUser?.role || USER_ROLE.USER)}`}
              >
                <span className="flex items-center gap-1">
                  {getRoleIcon(infoUser?.role || USER_ROLE.USER)}
                  {getRoleName(infoUser?.role || USER_ROLE.USER)}
                </span>
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{infoUser?.email || 'Chưa cập nhật'}</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{infoUser?.phone || 'Chưa cập nhật'}</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{infoUser?.address || 'Chưa cập nhật'}</span>
              </div>

              {infoUser?.createdAt && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Tham gia{' '}
                    {format(new Date(infoUser.createdAt), 'dd/MM/yyyy', {
                      locale: vi
                    })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Thông tin chi tiết</CardTitle>
              {!isEditing ? (
                <Button onClick={handleEdit} variant="outline" size="sm">
                  <Edit3 className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    size="sm"
                    disabled={updateProfileMutation.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {updateProfileMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="mr-2 h-4 w-4" />
                    Hủy
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Họ và tên</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            fullName: e.target.value
                          }))
                        }
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            email: e.target.value
                          }))
                        }
                        placeholder="Nhập email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Tên đăng nhập</Label>
                    <Input
                      id="username"
                      value={infoUser?.username || infoUser?.userName || ''}
                      disabled
                      className="bg-gray-50"
                      placeholder="Tên đăng nhập"
                    />
                    <p className="text-xs text-gray-500">
                      Tên đăng nhập không thể thay đổi
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            phone: e.target.value
                          }))
                        }
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Địa chỉ</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            address: e.target.value
                          }))
                        }
                        placeholder="Nhập địa chỉ"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Giới thiệu</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          bio: e.target.value
                        }))
                      }
                      placeholder="Viết một vài dòng giới thiệu về bản thân..."
                      rows={4}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Họ và tên
                      </Label>
                      <p className="mt-1 text-sm text-gray-900">
                        {getFullName() || 'Chưa cập nhật'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Email
                      </Label>
                      <p className="mt-1 text-sm text-gray-900">
                        {infoUser?.email || 'Chưa cập nhật'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Tên đăng nhập
                      </Label>
                      <p className="mt-1 text-sm text-gray-900">
                        {infoUser?.username ||
                          infoUser?.userName ||
                          'Chưa cập nhật'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Số điện thoại
                      </Label>
                      <p className="mt-1 text-sm text-gray-900">
                        {infoUser?.phone || 'Chưa cập nhật'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Địa chỉ
                      </Label>
                      <p className="mt-1 text-sm text-gray-900">
                        {infoUser?.address || 'Chưa cập nhật'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Giới thiệu
                    </Label>
                    <p className="mt-1 text-sm text-gray-900">
                      {infoUser?.bio || 'Chưa có thông tin giới thiệu'}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
