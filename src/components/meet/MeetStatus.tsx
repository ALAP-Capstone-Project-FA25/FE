import React from 'react';
import { Video, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface MeetStatusProps {
  meetLink: string;
  isUser: boolean;
  className?: string;
}

export const MeetStatus: React.FC<MeetStatusProps> = ({
  meetLink,
  isUser,
  className = ''
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = async () => {
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
    window.open(meetLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div
        className={`flex items-start gap-3 rounded-lg p-3 ${
          isUser
            ? 'bg-white/10'
            : 'border border-blue-500/20 bg-blue-500/10'
        }`}
      >
        <div
          className={`rounded-lg p-2 ${
            isUser ? 'bg-white/10' : 'bg-blue-500/20'
          }`}
        >
          <Video
            className={`h-5 w-5 ${
              isUser ? 'text-white' : 'text-blue-400'
            }`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-1.5 text-sm font-medium">
            {isUser
              ? 'Bạn đã gửi link meeting'
              : 'Mentor đã gửi link meeting'}
          </p>
          <p
            className={`break-all font-mono text-xs ${
              isUser
                ? 'text-orange-100'
                : 'text-blue-400'
            }`}
          >
            {meetLink}
          </p>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopyLink}
          className={`gap-2 ${
            isUser
              ? 'border-white/20 bg-white/10 text-white hover:bg-white/20'
              : 'border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
          }`}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? 'Đã copy' : 'Copy link'}
        </Button>
        
        <Button
          size="sm"
          onClick={handleOpenMeet}
          className={`gap-2 ${
            isUser
              ? 'bg-white/10 text-white hover:bg-white/20'
              : 'bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600'
          }`}
        >
          <ExternalLink className="h-4 w-4" />
          Tham gia meeting
        </Button>
      </div>
    </div>
  );
};