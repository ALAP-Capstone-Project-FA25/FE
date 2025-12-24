import BaseRequest from '@/config/axios.config';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useCreateUpdateEvent = () => {
  return useMutation({
    mutationKey: ['create-update-event'],
    mutationFn: async (data: any) => {
      return BaseRequest.Post(`/api/Event/create-update`, data);
    }
  });
};

export const useGetEventsByPaging = (
  page: number,
  pageLimit: number,
  keyword: string
) => {
  return useQuery({
    queryKey: ['events', page, pageLimit, keyword],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append('pageNumber', page.toString());
      if (pageLimit) params.append('pageSize', pageLimit.toString());
      if (keyword) params.append('keyword', keyword);

      return BaseRequest.Get(`/api/Event/get-by-paging?${params.toString()}`);
    }
  });
};

export const useGetEventTicketByEventId = (
  page: number,
  pageLimit: number,
  keyword: string,
  eventId: any
) => {
  return useQuery({
    queryKey: ['events', page, pageLimit, keyword],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append('pageNumber', page.toString());
      if (pageLimit) params.append('pageSize', pageLimit.toString());
      if (keyword) params.append('keyword', keyword);
      if (eventId) params.append('eventId', eventId.toString());
      console.log(eventId);
      return BaseRequest.Get(
        `/api/EventTicket/get-by-paging?${params.toString()}`
      );
    }
  });
};

export const useSendCommision = () => {
  return useMutation({
    mutationKey: ['send-commision'],
    mutationFn: async ({ eventId, paymentProofImageUrl }: { eventId: number; paymentProofImageUrl: string }) => {
      return BaseRequest.Post(`/api/Event/send-commission/${eventId}`, {
        paymentProofImageUrl
      });
    }
  });
};

export const useCancelEvent = () => {
  return useMutation({
    mutationKey: ['cancel-event'],
    mutationFn: async (eventId: number) => {
      return BaseRequest.Post(`/api/Event/cancel/${eventId}`);
    }
  });
};
