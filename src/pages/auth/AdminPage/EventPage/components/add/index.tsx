import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Calendar,
  DollarSign,
  Link,
  Users,
  Video,
  Image as ImageIcon,
  FileText,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import SingleFileUpload from '@/components/shared/single-file-upload';
import { USER_ROLE } from '@/constants/data';
import { useCreateUpdateEvent } from '@/queries/event.query';
import { useGetUsersByPagingByRole } from '@/queries/user.query';
import { toast } from '@/components/ui/use-toast';

const formSchema = z.object({
  title: z.string().min(1, 'Tiêu đề là bắt buộc').max(200, 'Tiêu đề quá dài'),
  description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự'),
  startDate: z.string().min(1, 'Ngày bắt đầu là bắt buộc'),
  endDate: z.string().min(1, 'Ngày kết thúc là bắt buộc'),
  meetingLink: z
    .string()
    .url('Link họp không hợp lệ')
    .optional()
    .or(z.literal('')),
  commissionRate: z
    .number()
    .min(0, 'Tỷ lệ hoa hồng phải >= 0')
    .max(100, 'Tỷ lệ hoa hồng phải <= 100'),
  amount: z.number().min(0, 'Số tiền phải >= 0'),
  status: z.number(),
  speakerId: z.number().min(1, 'Vui lòng chọn diễn giả'),
  videoUrl: z
    .string()
    .url('Link video không hợp lệ')
    .optional()
    .or(z.literal(''))
});

type FormValues = z.infer<typeof formSchema>;

// Helper function to extract YouTube video ID
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export default function CreateEventForm() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  const { mutateAsync: createUpdateEvent, isPending } = useCreateUpdateEvent();
  const { data: speakersData } = useGetUsersByPagingByRole(
    1,
    100,
    '',
    USER_ROLE.SPEAKER
  );

  const speakers = speakersData?.listObjects || [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      meetingLink: '',
      commissionRate: 0,
      amount: 0,
      status: 1,
      speakerId: 0,
      videoUrl: ''
    }
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        id: 0,
        ...values,
        imageUrls: imageUrl || '',
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString()
      };

      const [err] = await createUpdateEvent(payload);

      if (err) {
        toast({
          title: 'Lỗi',
          description: err.message || 'Có lỗi xảy ra',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Thành công!',
          description: 'Sự kiện đã được tạo thành công',
          variant: 'success'
        });
      }
    } catch (error) {
      // Handle error
      console.error('Error creating event:', error);
    }
  };

  // Watch videoUrl for preview
  const videoUrl = form.watch('videoUrl');

  // Update video preview when URL changes
  const handleVideoUrlChange = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    setVideoPreviewUrl(
      videoId ? `https://www.youtube.com/embed/${videoId}` : null
    );
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Tạo sự kiện mới
        </h1>
        <p className="text-gray-600">
          Điền thông tin để tạo sự kiện cho học viên
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Card */}
          <Card className="border-orange-100">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-white">
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <FileText className="h-5 w-5 text-orange-600" />
                Thông tin cơ bản
              </CardTitle>
              <CardDescription>Thông tin chính về sự kiện</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-gray-700">
                      Tiêu đề sự kiện <span className="text-orange-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập tiêu đề sự kiện..."
                        {...field}
                        className="focus:border-orange-500 focus:ring-orange-500"
                      />
                    </FormControl>
                    <FormMessage className="text-orange-600" />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-gray-700">
                      Mô tả <span className="text-orange-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả chi tiết về sự kiện..."
                        className="min-h-[120px] resize-none focus:border-orange-500 focus:ring-orange-500"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-gray-500">
                      Mô tả chi tiết giúp học viên hiểu rõ hơn về sự kiện
                    </FormDescription>
                    <FormMessage className="text-orange-600" />
                  </FormItem>
                )}
              />

              {/* Speaker Selection */}
              <FormField
                control={form.control}
                name="speakerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-medium text-gray-700">
                      <Users className="h-4 w-4 text-orange-600" />
                      Diễn giả <span className="text-orange-600">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="focus:border-orange-500 focus:ring-orange-500">
                          <SelectValue placeholder="Chọn diễn giả" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {speakers.map((speaker) => (
                          <SelectItem
                            key={speaker.id}
                            value={speaker.id.toString()}
                          >
                            <div className="flex items-center gap-2">
                              {speaker.avatar && (
                                <img
                                  src={speaker.avatar}
                                  alt={speaker.username}
                                  className="h-6 w-6 rounded-full object-cover"
                                />
                              )}
                              <span>{`${speaker.firstName} ${speaker.lastName}`}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-orange-600" />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Date & Time Card */}
          <Card className="border-orange-100">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-white">
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <Clock className="h-5 w-5 text-orange-600" />
                Thời gian
              </CardTitle>
              <CardDescription>Lịch trình diễn ra sự kiện</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Start Date */}
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 font-medium text-gray-700">
                        <Calendar className="h-4 w-4 text-orange-600" />
                        Ngày bắt đầu <span className="text-orange-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          className="focus:border-orange-500 focus:ring-orange-500"
                        />
                      </FormControl>
                      <FormMessage className="text-orange-600" />
                    </FormItem>
                  )}
                />

                {/* End Date */}
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 font-medium text-gray-700">
                        <Calendar className="h-4 w-4 text-orange-600" />
                        Ngày kết thúc <span className="text-orange-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          className="focus:border-orange-500 focus:ring-orange-500"
                        />
                      </FormControl>
                      <FormMessage className="text-orange-600" />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Media Card */}
          <Card className="border-orange-100">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-white">
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <ImageIcon className="h-5 w-5 text-orange-600" />
                Media & Links
              </CardTitle>
              <CardDescription>Hình ảnh và video cho sự kiện</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Image Upload */}
              <div>
                <FormLabel className="mb-3 block font-medium text-gray-700">
                  Hình ảnh sự kiện
                </FormLabel>
                <SingleFileUpload
                  onFileUploaded={(url) => setImageUrl(url)}
                  acceptedFileTypes={['image/*']}
                  maxFileSize={5}
                  placeholder="Kéo thả ảnh hoặc click để chọn"
                  autoUpload={true}
                />
                {imageUrl && (
                  <div className="relative mt-4 overflow-hidden rounded-lg border-2 border-orange-200">
                    <img
                      src={imageUrl}
                      alt="Event preview"
                      className="h-48 w-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Video URL */}
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-medium text-gray-700">
                      <Video className="h-4 w-4 text-orange-600" />
                      Video giới thiệu
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://www.youtube.com/watch?v=..."
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleVideoUrlChange(e.target.value);
                        }}
                        className="focus:border-orange-500 focus:ring-orange-500"
                      />
                    </FormControl>
                    <FormDescription className="text-gray-500">
                      Dán link video giới thiệu (nếu có)
                    </FormDescription>
                    <FormMessage className="text-orange-600" />
                  </FormItem>
                )}
              />

              {/* Video Preview */}
              {videoPreviewUrl && (
                <div className="overflow-hidden rounded-lg border-2 border-orange-200">
                  <iframe
                    width="100%"
                    height="315"
                    src={videoPreviewUrl}
                    title="YouTube video preview"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full"
                  ></iframe>
                </div>
              )}

              {/* Meeting Link */}
              <FormField
                control={form.control}
                name="meetingLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-medium text-gray-700">
                      <Link className="h-4 w-4 text-orange-600" />
                      Link tham gia
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://meet.google.com/..."
                        {...field}
                        className="focus:border-orange-500 focus:ring-orange-500"
                      />
                    </FormControl>
                    <FormDescription className="text-gray-500">
                      Link Zoom, Google Meet hoặc nền tảng khác
                    </FormDescription>
                    <FormMessage className="text-orange-600" />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Pricing & Commission Card */}
          <Card className="border-orange-100">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-white">
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <DollarSign className="h-5 w-5 text-orange-600" />
                Chi phí & Hoa hồng
              </CardTitle>
              <CardDescription>Thông tin giá và hoa hồng</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Amount */}
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-gray-700">
                        Giá vé (VNĐ)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                          className="focus:border-orange-500 focus:ring-orange-500"
                        />
                      </FormControl>
                      <FormMessage className="text-orange-600" />
                    </FormItem>
                  )}
                />

                {/* Commission Rate */}
                <FormField
                  control={form.control}
                  name="commissionRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-gray-700">
                        Tỷ lệ hoa hồng (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                          className="focus:border-orange-500 focus:ring-orange-500"
                        />
                      </FormControl>
                      <FormDescription className="text-gray-500">
                        Từ 0% đến 100%
                      </FormDescription>
                      <FormMessage className="text-orange-600" />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Status */}

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
              onClick={() => form.reset()}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md transition-all hover:from-orange-600 hover:to-orange-700 hover:shadow-lg"
            >
              {isPending ? (
                <>
                  <span className="mr-2">Đang tạo...</span>
                  <span className="animate-spin">⏳</span>
                </>
              ) : (
                'Tạo sự kiện'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
