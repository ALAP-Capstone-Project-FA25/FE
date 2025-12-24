import BaseRequest from '@/config/axios.config';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useGetPaymentByPaging = (
  page: number,
  pageLimit: number,
  keyword: string,
  status?: number
) => {
  return useQuery({
    queryKey: ['payments', page, pageLimit, keyword, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append('pageNumber', page.toString());
      if (pageLimit) params.append('pageSize', pageLimit.toString());
      if (keyword) params.append('keyword', keyword);
      if (status !== undefined) params.append('status', status.toString());

      return BaseRequest.Get(`/api/Payment/get-by-paging?${params.toString()}`);
    }
  });
};

export const useUpdatePaymentStatus = () => {
  return useMutation({
    mutationKey: ['update-payment-status'],
    mutationFn: async ({ id, status }: { id: number; status: number }) => {
      return BaseRequest.Post(`/api/Payment/update-status/${id}`, { status });
    }
  });
};

export const useGetPaymentStatistics = () => {
  return useQuery({
    queryKey: ['payment-statistics'],
    queryFn: async () => {
      return BaseRequest.Get('/api/Payment/statistics');
    }
  });
};
