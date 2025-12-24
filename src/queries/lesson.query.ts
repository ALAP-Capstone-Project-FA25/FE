import BaseRequest from '@/config/axios.config';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CreateUpdateLessonDto } from '@/types/api.types';

// Get Lesson by ID
export const useGetLessonById = (id: number) => {
  return useQuery({
    queryKey: ['lesson', id],
    queryFn: async () => {
      return BaseRequest.Get(`/api/Lesson/${id}`);
    },
    enabled: !!id
  });
};

// Get Lessons with Paging
export const useGetLessonsByPaging = (
  page: number,
  pageLimit: number,
  keyword: string
) => {
  return useQuery({
    queryKey: ['lessons', page, pageLimit, keyword],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (pageLimit) params.append('pageSize', pageLimit.toString());
      if (keyword) params.append('keyword', keyword);

      return BaseRequest.Get(`/api/Lesson/get-by-paging?${params.toString()}`);
    }
  });
};

// Get Lessons by Topic ID
export const useGetLessonsByTopicId = (topicId: number) => {
  return useQuery({
    queryKey: ['lessons', 'topic', topicId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('topicId', topicId.toString());
      return BaseRequest.Get(`/api/Lesson/get-by-paging?${params.toString()}`);
    },
    enabled: !!topicId
  });
};

// Create or Update Lesson
export const useCreateUpdateLesson = () => {
  return useMutation({
    mutationKey: ['create-update-lesson'],
    mutationFn: async (data: CreateUpdateLessonDto) => {
      return BaseRequest.Post(`/api/Lesson/create-update`, data);
    }
  });
};

// Delete Lesson
export const useDeleteLesson = () => {
  return useMutation({
    mutationKey: ['delete-lesson'],
    mutationFn: async (id: number) => {
      return BaseRequest.Delete(`/api/Lesson/delete/${id}`);
    }
  });
};

export const useGetLessonNoteByLessonId = (lessonId: number) => {
  return useQuery({
    queryKey: ['lesson-note', lessonId],
    queryFn: async () => {
      return BaseRequest.Get(`/api/LessonNote/get-by-lesson/${lessonId}`);
    },
    enabled: !!lessonId
  });
};

export const useCreateUpdateLessonNote = () => {
  return useMutation({
    mutationKey: ['create-update-lesson-note'],
    mutationFn: async (data: any) => {
      return BaseRequest.Post(`/api/LessonNote/create-update`, data);
    }
  });
};

export const useDeleteLessonNote = () => {
  return useMutation({
    mutationKey: ['delete-lesson-note'],
    mutationFn: async (id: number) => {
      return BaseRequest.Delete(`/api/LessonNote/delete/${id}`);
    }
  });
};
