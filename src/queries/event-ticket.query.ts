import BaseRequest from '@/config/axios.config';
import { useMutation, useQuery } from '@tanstack/react-query';
import { UserTicketStatusDto, TFUResponse } from '@/types/api.types';

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
  return useQuery<UserTicketStatusDto>({
    queryKey: ['check-user-ticket', eventId],
    queryFn: async () => {
      const response = await BaseRequest.Get<TFUResponse<UserTicketStatusDto>>(
        `/api/EventTicket/check-user-ticket/${eventId}`
      );
      // Response từ BaseRequest.Get đã là response.data từ axios interceptor
      // Nên response ở đây là TFUResponse { success, data, message, statusCode }
      // Cần lấy response.data để có UserTicketStatusDto
      const tfuResponse = response as TFUResponse<UserTicketStatusDto>;
      const ticketData = tfuResponse?.data || (response as any)?.data || response;
      return ticketData || { hasTicket: false };
    },
    enabled: enabled && !!eventId,
    retry: 1, // Only retry once on error
    retryDelay: 1000
  });
};

// Refund Info Types
export interface RefundInfoDto {
  ticketId: number;
  eventTitle: string;
  amount: number;
  bankAccountNumber: string;
  bankName: string;
  bankAccountHolderName: string;
  isRefunded: boolean;
}

export const useGetRefundInfo = (ticketId: string | undefined) => {
  return useQuery<RefundInfoDto>({
    queryKey: ['refund-info', ticketId],
    queryFn: async () => {
      if (!ticketId) {
        throw new Error('Ticket ID is required');
      }
      const response = await BaseRequest.Get(
        `/api/EventTicket/get-refund-info/${ticketId}`
      );
      // BaseRequest.Get trả về TFUResponse từ axios interceptor
      // Cần unwrap để lấy data
      const tfuResponse = response as TFUResponse<RefundInfoDto>;
      if (tfuResponse?.data) {
        return tfuResponse.data;
      }
      // Fallback: nếu không có structure TFUResponse, trả về response trực tiếp
      return response as RefundInfoDto;
    },
    enabled: !!ticketId,
    retry: 1
  });
};

export const useSubmitRefundInfo = () => {
  return useMutation({
    mutationKey: ['submit-refund-info'],
    mutationFn: async (payload: {
      ticketId: number;
      bankAccountNumber: string;
      bankName: string;
      bankAccountHolderName: string;
    }) => {
      const [error, response] = await BaseRequest.Post<TFUResponse<any>>(
        '/api/EventTicket/submit-refund-info',
        payload
      );
      if (error) {
        const errorMessage =
          (error as any)?.data?.message || 'Đã xảy ra lỗi';
        throw new Error(errorMessage);
      }
      // Response từ BaseRequest.Post là [null, data] hoặc [error, null]
      // data ở đây có thể là TFUResponse hoặc trực tiếp là data
      const tfuResponse = response as TFUResponse<any>;
      if (tfuResponse?.success === false) {
        throw new Error(tfuResponse?.message || 'Gửi thông tin thất bại');
      }
      return response;
    }
  });
};