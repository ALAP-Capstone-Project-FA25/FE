import { useState, useEffect } from 'react';
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
  Clock,
  Edit,
  Eye,
  Banknote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import SingleFileUpload from '@/components/shared/single-file-upload';
import { USER_ROLE } from '@/constants/data';
import { useCreateUpdateEvent } from '@/queries/event.query';
import { useGetUsersByPagingByRole } from '@/queries/user.query';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

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

interface CellActionProps {
  data: any;
}

// Helper function to extract YouTube video ID
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// Helper function to format datetime for input
const formatDateTimeForInput = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(
    data.imageUrls || null
  );
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
      title: data.title || '',
      description: data.description || '',
      startDate: formatDateTimeForInput(data.startDate),
      endDate: formatDateTimeForInput(data.endDate),
      meetingLink: data.meetingLink || '',
      commissionRate: data.commissionRate || 0,
      amount: data.amount || 0,
      status: data.status || 1,
      speakerId: data.speakerId || 0,
      videoUrl: data.videoUrl || ''
    }
  });

  // Set video preview on mount
  useEffect(() => {
    if (data.videoUrl) {
      const videoId = getYouTubeVideoId(data.videoUrl);
      setVideoPreviewUrl(
        videoId ? `https://www.youtube.com/embed/${videoId}` : null
      );
    }
  }, [data.videoUrl]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        id: data.id, // Sử dụng id từ data để cập nhật
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
          description: 'Sự kiện đã được cập nhật thành công',
          variant: 'success'
        });
        setOpen(false);
      }
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  // Handle video URL change for preview
  const handleVideoUrlChange = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    setVideoPreviewUrl(
      videoId ? `https://www.youtube.com/embed/${videoId}` : null
    );
  };
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
        onClick={() => navigate(`/admin/events/${data.id}/users`)}
      >
        <Users className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] max-w-4xl p-0">
          <DialogHeader className="border-b bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Chỉnh sửa sự kiện
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Cập nhật thông tin sự kiện của bạn
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-8rem)]">
            <div className="px-6 py-4">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Thông tin cơ bản */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-orange-100 pb-2">
                      <FileText className="h-5 w-5 text-orange-600" />
                      <h3 className="font-semibold text-gray-900">
                        Thông tin cơ bản
                      </h3>
                    </div>

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Tiêu đề sự kiện{' '}
                            <span className="text-orange-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nhập tiêu đề sự kiện..."
                              {...field}
                              className="focus:border-orange-400 focus:ring-orange-400/20"
                            />
                          </FormControl>
                          <FormMessage className="text-orange-600" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Mô tả <span className="text-orange-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Mô tả chi tiết về sự kiện..."
                              className="min-h-[100px] resize-none focus:border-orange-400 focus:ring-orange-400/20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-orange-600" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="speakerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Users className="h-4 w-4 text-orange-600" />
                            Diễn giả <span className="text-orange-600">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(parseInt(value))
                            }
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger className="focus:border-orange-400 focus:ring-orange-400/20">
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
                  </div>

                  {/* Thời gian */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-orange-100 pb-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <h3 className="font-semibold text-gray-900">Thời gian</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <Calendar className="h-4 w-4 text-orange-600" />
                              Ngày bắt đầu{' '}
                              <span className="text-orange-600">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="datetime-local"
                                {...field}
                                className="focus:border-orange-400 focus:ring-orange-400/20"
                              />
                            </FormControl>
                            <FormMessage className="text-orange-600" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <Calendar className="h-4 w-4 text-orange-600" />
                              Ngày kết thúc{' '}
                              <span className="text-orange-600">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="datetime-local"
                                {...field}
                                className="focus:border-orange-400 focus:ring-orange-400/20"
                              />
                            </FormControl>
                            <FormMessage className="text-orange-600" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Media & Links */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-orange-100 pb-2">
                      <ImageIcon className="h-5 w-5 text-orange-600" />
                      <h3 className="font-semibold text-gray-900">
                        Media & Links
                      </h3>
                    </div>

                    <div>
                      <FormLabel className="mb-3 block text-sm font-medium text-gray-700">
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
                        <div className="relative mt-4 overflow-hidden rounded-lg border border-orange-200">
                          <img
                            src={imageUrl}
                            alt="Event preview"
                            className="h-40 w-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="videoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
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
                              className="focus:border-orange-400 focus:ring-orange-400/20"
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-gray-500">
                            Dán link video YouTube (nếu có)
                          </FormDescription>
                          <FormMessage className="text-orange-600" />
                        </FormItem>
                      )}
                    />

                    {videoPreviewUrl && (
                      <div className="overflow-hidden rounded-lg border border-orange-200">
                        <iframe
                          width="100%"
                          height="250"
                          src={videoPreviewUrl}
                          title="YouTube video preview"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full"
                        ></iframe>
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="meetingLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Link className="h-4 w-4 text-orange-600" />
                            Link tham gia
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://meet.google.com/..."
                              {...field}
                              className="focus:border-orange-400 focus:ring-orange-400/20"
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-gray-500">
                            Link Zoom, Google Meet hoặc nền tảng khác
                          </FormDescription>
                          <FormMessage className="text-orange-600" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Chi phí & Hoa hồng */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-orange-100 pb-2">
                      <DollarSign className="h-5 w-5 text-orange-600" />
                      <h3 className="font-semibold text-gray-900">
                        Chi phí & Hoa hồng
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Giá vé (VNĐ)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="focus:border-orange-400 focus:ring-orange-400/20"
                              />
                            </FormControl>
                            <FormMessage className="text-orange-600" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="commissionRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Tỷ lệ hoa hồng (%)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="focus:border-orange-400 focus:ring-orange-400/20"
                              />
                            </FormControl>
                            <FormDescription className="text-xs text-gray-500">
                              Từ 0% đến 100%
                            </FormDescription>
                            <FormMessage className="text-orange-600" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 border-t pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-300 hover:bg-gray-50"
                      onClick={() => setOpen(false)}
                      disabled={isPending}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="bg-orange-500 text-white shadow-sm transition-all hover:bg-orange-600 hover:shadow-md disabled:opacity-50"
                    >
                      {isPending ? (
                        <>
                          <span className="mr-2">Đang lưu...</span>
                          <span className="animate-spin">⏳</span>
                        </>
                      ) : (
                        'Lưu thay đổi'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
        onClick={() => navigate(`/admin/events/${data.id}`)}
      >
        <Banknote className="h-4 w-4" />
      </Button>
    </div>
  );
};
