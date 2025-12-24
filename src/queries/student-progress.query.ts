import BaseRequest from '@/config/axios.config';
import { useQuery } from '@tanstack/react-query';

export const useGetStudentProgress = (userId: number, courseId: number) => {
  return useQuery({
    queryKey: ['student-progress', userId, courseId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('pageSize', '100');
      params.append('courseId', courseId.toString());
      params.append('studentId', userId.toString());

      return BaseRequest.Get(
        `/api/Topic/get-by-paging-for-mentor?${params.toString()}`
      );
    },
    enabled: !!userId && !!courseId && userId > 0 && courseId > 0
  });
};

export const useGetCurrentLesson = (userId: number, courseId: number) => {
  return useQuery({
    queryKey: ['current-lesson', userId, courseId],
    queryFn: async () => {
      return BaseRequest.Get(
        `/api/UserCourse/current-lesson/${userId}/${courseId}`
      );
    },
    enabled: !!userId && !!courseId,
    refetchInterval: 30000 // Refetch every 30 seconds
  });
};
