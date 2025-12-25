import BaseRequest from '@/config/axios.config';
import { useMutation, useQuery } from '@tanstack/react-query';
import { UpdatePackageDto } from '@/types/api.types';

export const useGetPackagesByPaging = (
  page: number,
  pageLimit: number,
  keyword: string
) => {
  return useQuery({
    queryKey: ['packages', page, pageLimit, keyword],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (pageLimit) params.append('pageSize', pageLimit.toString());
      if (keyword) params.append('keyword', keyword);

      return BaseRequest.Get(`/api/Package/get-by-paging?${params.toString()}`);
    }
  });
};

export const useBuyPackage = () => {
  return useMutation({
    mutationKey: ['buy-package'],
    mutationFn: async (packageId: number) => {
      return BaseRequest.Post(`/api/Package/buy-package/${packageId}`);
    }
  });
};

// Admin Package Queries
export const useGetAdminPackagesByPaging = (
  page: number,
  pageLimit: number,
  keyword: string
) => {
  return useQuery({
    queryKey: ['admin-packages', page, pageLimit, keyword],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (pageLimit) params.append('pageSize', pageLimit.toString());
      if (keyword) params.append('keyword', keyword);

      return BaseRequest.Get(
        `/api/Admin/AdminPackage/get-by-paging?${params.toString()}`
      );
    }
  });
};

export const useGetAdminPackageById = (id: number) => {
  return useQuery({
    queryKey: ['admin-package', id],
    queryFn: async () => {
      return BaseRequest.Get(`/api/Admin/AdminPackage/${id}`);
    },
    enabled: !!id
  });
};

export const useUpdatePackage = () => {
  return useMutation({
    mutationKey: ['update-package'],
    mutationFn: async ({
      id,
      data
    }: {
      id: number;
      data: UpdatePackageDto;
    }) => {
      return BaseRequest.Put(`/api/Admin/AdminPackage/${id}`, data);
    }
  });
};
