import BaseRequest from '@/config/axios.config';
import { useMutation, useQuery } from '@tanstack/react-query';
import { RefundFilter, UpdateRefundDto } from '@/types/refund';

export const useGetRefundList = (filter: RefundFilter) => {
  return useQuery({
    queryKey: ['refund-list', filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('pageNumber', filter.pageNumber.toString());
      params.append('pageSize', filter.pageSize.toString());
      if (filter.eventId) params.append('eventId', filter.eventId.toString());
      if (filter.isRefunded !== undefined) params.append('isRefunded', filter.isRefunded.toString());
      if (filter.keyword) params.append('keyword', filter.keyword);

      return BaseRequest.Get(`/api/EventTicket/refund-list?${params.toString()}`);
    }
  });
};

export const useUpdateRefund = () => {
  return useMutation({
    mutationKey: ['update-refund'],
    mutationFn: async (data: UpdateRefundDto) => {
      return BaseRequest.Post(`/api/EventTicket/update-refund`, data);
    }
  });
};

export const useGetRefundStatistics = (eventId: number) => {
  return useQuery({
    queryKey: ['refund-statistics', eventId],
    queryFn: async () => {
      return BaseRequest.Get(`/api/EventTicket/refund-statistics/${eventId}`);
    },
    enabled: !!eventId
  });
};

export const useGetRefundStatisticsOverall = () => {
  return useQuery({
    queryKey: ['refund-statistics-overall'],
    queryFn: async () => {
      return BaseRequest.Get(`/api/EventTicket/refund-statistics-overall`);
    }
  });
};
