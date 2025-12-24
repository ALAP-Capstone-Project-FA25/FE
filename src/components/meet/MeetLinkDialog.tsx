import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Video, Copy, ExternalLink, Check, Loader2 } from 'lucide-react';
import { useMeet } from '../../hooks/useMeet';
import { toast } from 'sonner';

interface MeetLinkDialogProps {
  trigger?: React.ReactNode;
  mentorId?: number;
  studentId?: number;
}

export const MeetLinkDialog: React.FC<MeetLinkDialogProps> = ({
  trigger,
  mentorId,
  studentId,
}) => {
  const [open, setOpen] = useState(false);
  const [meetLink, setMeetLink] = useState<string>('');
  const [copied, setCopied] = useState(false);
  
  const { 
    isLoading, 
    generateMeetLink, 
    generateMeetLinkForSession 
  } = useMeet();

  const handleGenerateLink = async () => {
    try {
      let link: string;
      
      if (mentorId && studentId) {
        const result = await generateMeetLinkForSession(mentorId, studentId);
        link = result?.meetLink || '';
      } else {
        link = await generateMeetLink() || '';
      }
      
      setMeetLink(link);
    } catch (error) {
      console.error('Error generating meet link:', error);
    }
  };

  const handleCopyLink = async () => {
    if (!meetLink) return;
    
    try {
      await navigator.clipboard.writeText(meetLink);
      setCopied(true);
      toast.success('Link đã được copy vào clipboard!');
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Không thể copy link');
    }
  };

  const handleOpenMeet = () => {
    if (meetLink) {
      window.open(meetLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setMeetLink('');
      setCopied(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Video className="h-4 w-4" />
            Tạo Meet Link
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Tạo Google Meet Link
          </DialogTitle>
          <DialogDescription>
            {mentorId && studentId 
              ? 'Tạo link Meet cho cuộc họp giữa mentor và student'
              : 'Tạo link Google Meet mới cho cuộc họp'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {!meetLink ? (
            <div className="text-center py-4">
              <Button 
                onClick={handleGenerateLink}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Video className="h-4 w-4" />
                )}
                {isLoading ? 'Đang tạo...' : 'Tạo Meet Link'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meet-link">Meet Link</Label>
                <div className="flex gap-2">
                  <Input
                    id="meet-link"
                    value={meetLink}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopyLink}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={handleGenerateLink}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Video className="h-4 w-4" />
                  )}
                  Tạo Link Mới
                </Button>
                
                <Button
                  onClick={handleOpenMeet}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Mở Meet
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};