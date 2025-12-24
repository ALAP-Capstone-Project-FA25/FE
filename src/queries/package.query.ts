import BaseRequest from '@/config/axios.config';
import { useMutation, useQuery } from '@tanstack/react-query';

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
