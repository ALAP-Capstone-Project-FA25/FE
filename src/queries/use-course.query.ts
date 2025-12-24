import BaseRequest from '@/config/axios.config';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useUpdateProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['update-progress'],
    mutationFn: async (data: any) => {
      return BaseRequest.Put(
        `/api/UserCourse/update-lesson-progress/${data.topicId}/${data.lessonId}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['get-topics-by-paging-by-user']
      });
    }
  });
};

export const useGetUserCourseByCourseId = (courseId: number) => {
  return useQuery({
    queryKey: ['get-user-course-by-course', courseId],
    queryFn: async () => {
      return BaseRequest.Get(
        `/api/UserCourse/get-user-course-by-course/${courseId}`
      );
    }
  });
};

export const useGetUserCourseById = (courseId) => {
  return useQuery({
    queryKey: ['get-user-course-by-id', courseId],
    queryFn: async () => {
      return BaseRequest.Get(`/api/UserCourse/${courseId}`);
    }
  });
};
