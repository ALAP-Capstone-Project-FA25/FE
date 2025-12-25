import BaseRequest from '@/config/axios.config';
import { useMutation, useQuery } from '@tanstack/react-query';
import { TFUResponse, Course, CreateUpdateCourseDto } from '@/types/api.types';

export const useGetCourseById = (id: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['course', id],
    queryFn: async (): Promise<TFUResponse<Course>> => {
      return BaseRequest.Get(`/api/Course/${id}`);
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!id
  });
};

// Get Courses with Paging
export const useGetCoursesByPaging = (
  page: number,
  pageLimit: number,
  keyword: string
) => {
  return useQuery({
    queryKey: ['courses', page, pageLimit, keyword],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append('pageNumber', page.toString());
      if (pageLimit) params.append('pageSize', pageLimit.toString());
      if (keyword) params.append('keyword', keyword);

      return BaseRequest.Get(`/api/Course/get-by-paging?${params.toString()}`);
    }
  });
};

export const useGetCoursesByUserPaging = (
  page: number,
  pageLimit: number,
  keyword: string
) => {
  return useQuery({
    queryKey: ['courses', page, pageLimit, keyword],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append('pageNumber', page.toString());
      if (pageLimit) params.append('pageSize', pageLimit.toString());
      if (keyword) params.append('keyword', keyword);

      return BaseRequest.Get(
        `/api/Course/get-by-paging-by-user?${params.toString()}`
      );
    }
  });
};
// Create or Update Course
export const useCreateUpdateCourse = () => {
  return useMutation({
    mutationKey: ['create-update-course'],
    mutationFn: async (data: CreateUpdateCourseDto) => {
      return BaseRequest.Post(`/api/Course/create-update`, data);
    }
  });
};

// Delete Course
export const useDeleteCourse = () => {
  return useMutation({
    mutationKey: ['delete-course'],
    mutationFn: async (id: number) => {
      return BaseRequest.Delete(`/api/Course/delete/${id}`);
    }
  });
};

export const useEnrollCourse = () => {
  return useMutation({
    mutationKey: ['enroll-course'],
    mutationFn: async (data: any) => {
      return BaseRequest.Post(`/api/UserCourse/enroll`, data);
    }
  });
};

export const useGetListCourseByCategoryId = (categoryId: number) => {
  return useQuery({
    queryKey: ['list-course-by-category', categoryId],
    queryFn: async () => {
      return BaseRequest.Get(
        `/api/Course/get-by-paging-by-category/${categoryId}`
      );
    }
  });
};

// Get My Courses (enrolled courses)
export const useGetMyCourses = () => {
  return useQuery({
    queryKey: ['my-courses'],
    queryFn: async () => {
      return BaseRequest.Get(`/api/UserCourse/my-with-details`);
    }
  });
};