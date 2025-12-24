import { useState, useCallback } from 'react';
import meetService, { MeetLinkResponse } from '../services/meet.service';
import { toast } from 'sonner';

interface UseMeetReturn {
  isLoading: boolean;
  error: string | null;
  generateMeetLink: () => Promise<string | null>;
  generateMeetLinkForSession: (mentorId: number, studentId: number) => Promise<MeetLinkResponse | null>;
  generateAndCopyMeetLink: () => Promise<string | null>;
  generateAndOpenMeetLink: () => Promise<string | null>;
}

export const useMeet = (): UseMeetReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((error: any) => {
    const errorMessage = error?.message || 'Đã xảy ra lỗi không xác định';
    setError(errorMessage);
    toast.error(errorMessage);
    console.error('Meet service error:', error);
    return null;
  }, []);

  const generateMeetLink = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const meetLink = await meetService.generateMeetLink();
      toast.success('Tạo Meet link thành công!');
      return meetLink;
    } catch (error) {
      return handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const generateMeetLinkForSession = useCallback(async (
    mentorId: number, 
    studentId: number
  ): Promise<MeetLinkResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const meetingInfo = await meetService.generateMeetLinkForSession(mentorId, studentId);
      toast.success('Tạo Meet link cho session thành công!');
      return meetingInfo;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const generateAndCopyMeetLink = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const meetLink = await meetService.generateAndCopyMeetLink();
      toast.success('Meet link đã được tạo và copy vào clipboard!');
      return meetLink;
    } catch (error) {
      return handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const generateAndOpenMeetLink = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const meetLink = await meetService.generateAndOpenMeetLink();
      toast.success('Meet link đã được tạo và mở trong tab mới!');
      return meetLink;
    } catch (error) {
      return handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  return {
    isLoading,
    error,
    generateMeetLink,
    generateMeetLinkForSession,
    generateAndCopyMeetLink,
    generateAndOpenMeetLink,
  };
};