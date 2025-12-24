import BaseRequest from '@/config/axios.config';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CreateUpdateTopicDto } from '@/types/api.types';

// Get Topic by ID
export const useGetTopicById = (id: number) => {
  return useQuery({
    queryKey: ['topic', id],
    queryFn: async () => {
      return BaseRequest.Get(`/api/Topic/${id}`);
    },
    enabled: !!id
  });
};

// Get Topics with Paging
export const useGetTopicsByPaging = (
  page: number,
  pageLimit: number,
  keyword: string,
  courseId: number
) => {
  return useQuery({
    queryKey: ['topics', page, pageLimit, keyword, courseId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (pageLimit) params.append('pageSize', pageLimit.toString());
      if (keyword) params.append('keyword', keyword);
      if (courseId) params.append('courseId', courseId.toString());

      return BaseRequest.Get(`/api/Topic/get-by-paging?${params.toString()}`);
    }
  });
};

export const useGetTopicsByPagingByStudent = (
  page: number,
  pageLimit: number,
  keyword: string,
  courseId: number
) => {
  return useQuery({
    queryKey: [
      'get-topics-by-paging-by-user',
      page,
      pageLimit,
      keyword,
      courseId
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (pageLimit) params.append('pageSize', pageLimit.toString());
      if (keyword) params.append('keyword', keyword);
      if (courseId) params.append('courseId', courseId.toString());

      return BaseRequest.Get(
        `/api/Topic/get-by-paging-by-student?${params.toString()}`
      );
    }
  });
};

// Get Topics by Course ID
export const useGetTopicsByCourseId = (courseId: number) => {
  return useQuery({
    queryKey: ['topics', 'course', courseId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('courseId', courseId.toString());
      return BaseRequest.Get(`/api/Topic/get-by-paging?${params.toString()}`);
    },
    enabled: !!courseId
  });
};

export const useGetTopicsByCourseIdWithCourse = (courseId: number) => {
  return useQuery({
    queryKey: ['topics', 'course', courseId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('courseId', courseId.toString());
      return BaseRequest.Get(
        `/api/Topic/get-by-paging-with-course?${params.toString()}`
      );
    },
    enabled: !!courseId
  });
};

// Create or Update Topic
export const useCreateUpdateTopic = () => {
  return useMutation({
    mutationKey: ['create-update-topic'],
    mutationFn: async (data: CreateUpdateTopicDto) => {
      return BaseRequest.Post(`/api/Topic/create-update`, data);
    }
  });
};

// Delete Topic
export const useDeleteTopic = () => {
  return useMutation({
    mutationKey: ['delete-topic'],
    mutationFn: async (id: number) => {
      return BaseRequest.Delete(`/api/Topic/delete/${id}`);
    }
  });
};
