import BaseRequest from '@/config/axios.config';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useBuyEventTicket = () => {
  return useMutation({
    mutationKey: ['buy-event-ticket'],
    mutationFn: async (eventId: any) => {
      return BaseRequest.Post(`/api/EventTicket/buy-ticket/${eventId}`);
    }
  });
};

export const useGetMyTickets = () => {
  return useQuery({
    queryKey: ['my-ticket'],
    queryFn: async () => {
      return BaseRequest.Get(`/api/EventTicket/get-my-tickets`);
    }
  });
};

export const useCheckUserTicket = (eventId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['check-user-ticket', eventId],
    queryFn: async () => {
      return BaseRequest.Get(`/api/EventTicket/check-user-ticket/${eventId}`);
    },
    enabled: enabled && !!eventId,
    retry: 1, // Only retry once on error
    retryDelay: 1000
  });
};
