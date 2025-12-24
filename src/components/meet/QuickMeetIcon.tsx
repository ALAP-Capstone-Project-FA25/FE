import React from 'react';
import { Button } from '../ui/button';
import { Video, Loader2 } from 'lucide-react';
import { useMeet } from '../../hooks/useMeet';
import { cn } from '../../lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface QuickMeetIconProps {
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  className?: string;
  tooltipText?: string;
}

export const QuickMeetIcon: React.FC<QuickMeetIconProps> = ({
  size = 'icon',
  variant = 'default',
  className,
  tooltipText = 'Tạo Meet nhanh'
}) => {
  const { isLoading, generateAndOpenMeetLink } = useMeet();

  const handleClick = async () => {
    await generateAndOpenMeetLink();
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={handleClick}
            disabled={isLoading}
            className={cn('', className)}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Video className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isLoading ? 'Đang tạo...' : tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Variant với text
export const QuickMeetButton: React.FC<{
  className?: string;
  children?: React.ReactNode;
}> = ({ className, children }) => {
  const { isLoading, generateAndOpenMeetLink } = useMeet();

  const handleClick = async () => {
    await generateAndOpenMeetLink();
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      className={cn('gap-2', className)}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Video className="h-4 w-4" />
      )}
      {children || (isLoading ? 'Đang tạo...' : 'Meet nhanh')}
    </Button>
  );
};