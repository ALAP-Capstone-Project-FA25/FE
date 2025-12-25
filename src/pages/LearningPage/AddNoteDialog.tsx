import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Clock, StickyNote } from 'lucide-react';
import { formatTime } from './utils';

interface AddNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTime: number;
  onSave: (text: string) => void;
  isSaving?: boolean;
}

export default function AddNoteDialog({
  open,
  onOpenChange,
  currentTime,
  onSave,
  isSaving = false
}: AddNoteDialogProps) {
  const [noteText, setNoteText] = useState('');

  const handleSave = () => {
    if (noteText.trim()) {
      onSave(noteText.trim());
      setNoteText('');
    }
  };

  const handleClose = () => {
    setNoteText('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <StickyNote className="h-5 w-5 text-orange-500" />
            Thêm ghi chú
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Time Display */}
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Thời điểm ghi chú
              </p>
              <p className="text-lg font-bold text-blue-600">
                {formatTime(Math.floor(currentTime))}
              </p>
            </div>
          </div>

          {/* Note Input */}
          <div className="space-y-2">
            <Label htmlFor="note-text" className="text-sm font-medium">
              Nội dung ghi chú
            </Label>
            <Textarea
              id="note-text"
              placeholder="Nhập nội dung ghi chú của bạn..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={6}
              className="resize-none focus-visible:ring-orange-500"
              autoFocus
            />
            <p className="text-xs text-gray-500">
              {noteText.length}/500 ký tự
            </p>
          </div>

          {/* Tips */}
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
            <p className="text-xs text-orange-800">
              💡 <strong>Mẹo:</strong> Ghi chú sẽ được lưu tại thời điểm hiện
              tại của video. Bạn có thể click vào ghi chú để quay lại thời điểm
              đó.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
            className="mr-2"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={!noteText.trim() || isSaving}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            {isSaving ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang lưu...
              </>
            ) : (
              <>
                <StickyNote className="mr-2 h-4 w-4" />
                Lưu ghi chú
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
