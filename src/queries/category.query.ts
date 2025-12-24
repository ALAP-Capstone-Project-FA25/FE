import BaseRequest from '@/config/axios.config';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  TFUResponse,
  Category,
  CreateUpdateCategoryDto
} from '@/types/api.types';

// Get Category by ID
export const useGetCategoryById = (id: number) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: async (): Promise<TFUResponse<Category>> => {
      return BaseRequest.Get(`/api/Category/${id}`);
    },
    enabled: !!id
  });
};

// Get Categories with Paging
export const useGetCategoriesByPaging = (
  page: number,
  pageLimit: number,
  keyword: string
) => {
  return useQuery({
    queryKey: ['categories', page, pageLimit, keyword],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (pageLimit) params.append('pageSize', pageLimit.toString());
      if (keyword) params.append('keyword', keyword);

      return BaseRequest.Get(
        `/api/Category/get-by-paging?${params.toString()}`
      );
    }
  });
};

// Alias for compatibility
export const useGetListCategoryByPaging = useGetCategoriesByPaging;

export const useGetCategoriesByPagingByMajor = (
  page: number,
  pageLimit: number,
  keyword: string,
  majorId: number
) => {
  return useQuery({
    queryKey: ['categories-by-major', page, pageLimit, keyword],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (pageLimit) params.append('pageSize', pageLimit.toString());
      if (keyword) params.append('keyword', keyword);
      if (majorId) params.append('MajorId', majorId.toString());

      return BaseRequest.Get(
        `/api/Category/get-by-paging-by-major?${params.toString()}`
      );
    }
  });
};

// Create or Update Category
export const useCreateUpdateCategory = () => {
  return useMutation({
    mutationKey: ['create-update-category'],
    mutationFn: async (data: CreateUpdateCategoryDto) => {
      return BaseRequest.Post(`/api/Category/create-update`, data);
    }
  });
};

// Delete Category
export const useDeleteCategory = () => {
  return useMutation({
    mutationKey: ['delete-category'],
    mutationFn: async (id: number) => {
      return BaseRequest.Delete(`/api/Category/delete/${id}`);
    }
  });
};
