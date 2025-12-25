import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Video, FileText } from 'lucide-react';
import { LessonType } from '@/types/api.types';

interface LessonTypeSelectorProps {
  value: LessonType;
  onChange: (value: LessonType) => void;
}

export function LessonTypeSelector({
  value,
  onChange
}: LessonTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        Loại bài học <span className="text-orange-600">*</span>
      </Label>
      <Select
        value={value.toString()}
        onValueChange={(v) => onChange(parseInt(v) as LessonType)}
      >
        <SelectTrigger className="focus-visible:ring-orange-500">
          <SelectValue placeholder="Chọn loại bài học..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={LessonType.VIDEO.toString()}>
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-orange-600" />
              <span>Video</span>
            </div>
          </SelectItem>
          <SelectItem value={LessonType.DOCUMENT.toString()}>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span>Tài liệu</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
