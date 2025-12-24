import React from 'react';
import { Button } from '../ui/button';
import { Video, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { useMeet } from '../../hooks/useMeet';
import { cn } from '../../lib/utils';

interface MeetLinkButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  action?: 'generate' | 'copy' | 'open';
  mentorId?: number;
  studentId?: number;
  className?: string;
  children?: React.ReactNode;
}

export const MeetLinkButton: React.FC<MeetLinkButtonProps> = ({
  variant = 'default',
  size = 'default',
  action = 'generate',
  mentorId,
  studentId,
  className,
  children,
}) => {
  const { 
    isLoading, 
    generateMeetLink, 
    generateMeetLinkForSession,
    generateAndCopyMeetLink, 
    generateAndOpenMeetLink 
  } = useMeet();

  const handleClick = async () => {
    if (mentorId && studentId) {
      await generateMeetLinkForSession(mentorId, studentId);
      return;
    }

    switch (action) {
      case 'copy':
        await generateAndCopyMeetLink();
        break;
      case 'open':
        await generateAndOpenMeetLink();
        break;
      default:
        await generateMeetLink();
        break;
    }
  };

  const getIcon = () => {
    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
    
    switch (action) {
      case 'copy':
        return <Copy className="h-4 w-4" />;
      case 'open':
        return <ExternalLink className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  const getDefaultText = () => {
    switch (action) {
      case 'copy':
        return 'Tạo & Copy Meet Link';
      case 'open':
        return 'Tạo & Mở Meet';
      default:
        return 'Tạo Meet Link';
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={cn('gap-2', className)}
    >
      {getIcon()}
      {children || getDefaultText()}
    </Button>
  );
};

// Component riêng cho quick actions
export const QuickMeetActions: React.FC<{ 
  mentorId?: number; 
  studentId?: number;
  className?: string;
}> = ({ mentorId, studentId, className }) => {
  return (
    <div className={cn('flex gap-2', className)}>
      <MeetLinkButton
        variant="outline"
        size="sm"
        action="copy"
        mentorId={mentorId}
        studentId={studentId}
      >
        Copy Link
      </MeetLinkButton>
      
      <MeetLinkButton
        variant="default"
        size="sm"
        action="open"
        mentorId={mentorId}
        studentId={studentId}
      >
        Mở Meet
      </MeetLinkButton>
    </div>
  );
};