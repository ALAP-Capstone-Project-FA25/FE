'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Loader2,
  Mail,
  User,
  Phone,
  MapPin,
  FileText,
  Upload
} from 'lucide-react';
import { useCreateMentor, CreateMentorRequest } from '@/queries/mentor.query';
import SingleFileUpload from '@/components/shared/single-file-upload';

const createMentorSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Tên là bắt buộc')
    .max(100, 'Tên không được quá 100 ký tự'),
  lastName: z
    .string()
    .min(1, 'Họ là bắt buộc')
    .max(100, 'Họ không được quá 100 ký tự'),
  email: z
    .string()
    .email('Email không hợp lệ')
    .max(100, 'Email không được quá 100 ký tự'),
  phone: z
    .string()
    .max(100, 'Số điện thoại không được quá 100 ký tự')
    .optional(),
  address: z.string().max(255, 'Địa chỉ không được quá 255 ký tự').optional(),
  avatar: z.string().optional(),
  bio: z.string().max(500, 'Tiểu sử không được quá 500 ký tự').optional()
});

type CreateMentorFormData = z.infer<typeof createMentorSchema>;

interface CreateMentorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateMentorDialog({
  open,
  onOpenChange
}: CreateMentorDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const createMentorMutation = useCreateMentor();

  const form = useForm<CreateMentorFormData>({
    resolver: zodResolver(createMentorSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      avatar: '',
      bio: ''
    }
  });

  const onSubmit = async (data: CreateMentorFormData) => {
    setIsSubmitting(true);
    try {
      // Clean up empty optional fields
      const cleanData: CreateMentorRequest = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        ...(data.phone && { phone: data.phone }),
        ...(data.address && { address: data.address }),
        ...(avatarUrl && { avatar: avatarUrl }),
        ...(data.bio && { bio: data.bio })
      };

      await createMentorMutation.mutateAsync(cleanData);

      toast.success('Tạo tài khoản mentor thành công!', {
        description: 'Email chào mừng đã được gửi đến mentor.'
      });

      form.reset();
      setAvatarUrl('');
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Lỗi tạo tài khoản mentor', {
        description: error.message || 'Có lỗi xảy ra khi tạo tài khoản mentor.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5 text-orange-500" />
            Tạo tài khoản Mentor
          </DialogTitle>
          <DialogDescription>
            Tạo tài khoản mới cho mentor. Hệ thống sẽ tự động tạo mật khẩu và
            gửi email chào mừng.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">
                Thông tin cơ bản
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Tên <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Họ <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập họ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="mentor@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">
                Thông tin liên hệ
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Số điện thoại
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="0123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Địa chỉ
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập địa chỉ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">
                Thông tin bổ sung
              </h3>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  <Upload className="h-4 w-4" />
                  Avatar
                </label>
                <SingleFileUpload
                  onFileUploaded={(url) => setAvatarUrl(url)}
                  acceptedFileTypes={['image/*']}
                  maxFileSize={5}
                  placeholder="Kéo thả ảnh avatar hoặc click để chọn"
                  autoUpload={true}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Tiểu sử
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả ngắn về mentor..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <User className="mr-2 h-4 w-4" />
                    Tạo Mentor
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
