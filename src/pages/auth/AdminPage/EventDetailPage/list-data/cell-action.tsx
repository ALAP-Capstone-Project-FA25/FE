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

  return <div></div>;
};
