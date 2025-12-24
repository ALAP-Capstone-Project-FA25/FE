import BaseRequest from '@/config/axios.config';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useCreateUpdateSubject = () => {
  return useMutation({
    mutationKey: ['create-update-subject'],
    mutationFn: async (data: any) => {
      return BaseRequest.Post(`/api/Subject/create-update`, data);
    }
  });
};

export const useGetListSubjectByPaging = (
  page: number,
  pageLimit: number,
  keyword: string
) => {
  return useQuery({
    queryKey: ['subjects', page, pageLimit, keyword],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (pageLimit) params.append('pageSize', pageLimit.toString());
      if (keyword) params.append('keyword', keyword);

      return BaseRequest.Get(`/api/Subject/get-by-paging?${params.toString()}`);
    }
  });
};

export const useDeleteSubject = () => {
  return useMutation({
    mutationKey: ['delete-subject'],
    mutationFn: async (id: number) => {
      return BaseRequest.Delete(`/api/Subject/delete/${id}`);
    }
  });
};
