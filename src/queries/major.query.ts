import BaseRequest from '@/config/axios.config';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  TFUResponse,
  Major,
  CreateUpdateMajorDto
} from '@/types/api.types';

// Get Major by ID
export const useGetMajorById = (id: number) => {
  return useQuery({
    queryKey: ['major', id],
    queryFn: async (): Promise<TFUResponse<Major>> => {
      return BaseRequest.Get(`/api/Major/${id}`);
    },
    enabled: !!id
  });
};

// Get Majors with Paging
export const useGetListMajorByPaging = (
  page: number,
  pageLimit: number,
  keyword: string
) => {
  return useQuery({
    queryKey: ['majors', page, pageLimit, keyword],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (pageLimit) params.append('pageSize', pageLimit.toString());
      if (keyword) params.append('keyword', keyword);

      return BaseRequest.Get(
        `/api/Major/get-by-paging?${params.toString()}`
      );
    }
  });
};

// Create or Update Major
export const useCreateUpdateMajor = () => {
  return useMutation({
    mutationKey: ['create-update-major'],
    mutationFn: async (data: CreateUpdateMajorDto) => {
      return BaseRequest.Post(`/api/Major/create-update`, data);
    }
  });
};

// Delete Major
export const useDeleteMajor = () => {
  return useMutation({
    mutationKey: ['delete-major'],
    mutationFn: async (id: number) => {
      return BaseRequest.Delete(`/api/Major/delete/${id}`);
    }
  });
};

// Update User Major
export const useUpdateUserMajor = () => {
  return useMutation({
    mutationKey: ['update-user-major'],
    mutationFn: async ({ majorId }: { majorId: number }) => {
      return BaseRequest.Post(`/api/Major/update-user-major/${majorId}`, {});
    }
  });
};
