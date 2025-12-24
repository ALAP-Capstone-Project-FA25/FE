import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import BaseRequest from '@/config/axios.config';

export interface CreateMentorRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  bio?: string;
}

// Create mentor mutation
export const useCreateMentor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMentorRequest) => {
      const response = await BaseRequest.Post('/api/Mentor/create', data);
      if (response[0]) {
        throw new Error(
          response[0]?.data?.message || 'Failed to create mentor'
        );
      }
      return response[1];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['get-all-user'] });
    }
  });
};

// Get student video progress (initial load)
// Note: Real-time updates come from useStudentVideoTracking hook
// This hook returns null as initial state since video progress is tracked via SignalR
export const useGetStudentVideoProgress = (
  studentId: number,
  lessonId: number
) => {
  return useQuery({
    queryKey: ['student-video-progress', studentId, lessonId],
    queryFn: async () => {
      // Video progress is tracked via SignalR real-time in useStudentVideoTracking
      // This hook is mainly for initial state compatibility
      // Return null to let real-time tracking handle the progress
      return null;
    },
    enabled: !!studentId && !!lessonId && studentId > 0 && lessonId > 0,
    staleTime: Infinity, // Never refetch since we use real-time updates
    gcTime: 0 // Don't cache since we use real-time
  });
};

// Get student notes for a lesson
export const useGetStudentNotes = (studentId: number, lessonId: number) => {
  return useQuery({
    queryKey: ['student-notes', studentId, lessonId],
    queryFn: async () => {
      const response = await BaseRequest.Get(
        `/api/LessonNote/get-by-lesson/${lessonId}`
      );
      if (response[0]) {
        throw new Error(
          response[0]?.data?.message || 'Failed to get student notes'
        );
      }
      // Filter notes by studentId if needed, or return all notes for the lesson
      return {
        notes:
          response[1]?.notes || response[1]?.listObjects || response[1] || []
      };
    },
    enabled: !!studentId && !!lessonId && studentId > 0 && lessonId > 0
  });
};

// Get course topics for mentor view (with student progress)
export const useGetCourseTopicsForMentor = (
  courseId: number,
  studentId: number
) => {
  return useQuery({
    queryKey: ['course-topics-mentor', courseId, studentId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('pageSize', '100');
      params.append('courseId', courseId.toString());
      params.append('studentId', studentId.toString());

      const response = await BaseRequest.Get(
        `/api/Topic/get-by-paging-for-mentor?${params.toString()}`
      );
      if (response[0]) {
        throw new Error(
          response[0]?.data?.message || 'Failed to get course topics'
        );
      }
      return response[1];
    },
    enabled: !!courseId && !!studentId && courseId > 0 && studentId > 0
  });
};

// Get student progress (re-export from student-progress.query.ts for convenience)
export { useGetStudentProgress } from './student-progress.query';
