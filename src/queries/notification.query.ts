import BaseRequest from '@/config/axios.config';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export enum NotificationType {
  PAYMENT_SUCCESS = 1,
  PACKAGE_PURCHASE_SUCCESS = 2,
  EVENT_TICKET_PURCHASE_SUCCESS = 3,
  KNOWLEDGE_REINFORCEMENT = 4,
  EVENT_UPCOMING = 5,
  EVENT_STARTED = 6,
  EVENT_ENDED = 7,
  MENTOR_MESSAGE = 8,
  REFUND_PROCESSED = 9,
  ACCOUNT_REGISTERED = 10,
  ACCOUNT_VERIFIED = 11
}

export interface NotificationDto {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message?: string;
  linkUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  metadata?: string;
}

export interface PagedResult<T> {
  listObjects: T[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
}

export interface NotificationPagingParams {
  pageNumber?: number;
  pageSize?: number;
  isRead?: boolean;
}

export const useGetNotifications = (params?: NotificationPagingParams) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.pageNumber) {
        queryParams.append('pageNumber', params.pageNumber.toString());
      }
      if (params?.pageSize) {
        queryParams.append('pageSize', params.pageSize.toString());
      }
      if (params?.isRead !== undefined) {
        queryParams.append('isRead', params.isRead.toString());
      }

      const url = `/api/Notification/get-by-paging${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;
      return BaseRequest.Get<PagedResult<NotificationDto>>(url);
    }
  });
};

export const useGetUnreadNotificationCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const result = await BaseRequest.Get<{ count: number }>(
        '/api/Notification/unread-count'
      );
      return result.count;
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return BaseRequest.Post(`/api/Notification/mark-as-read/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return BaseRequest.Post('/api/Notification/mark-all-as-read', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return BaseRequest.Delete(`/api/Notification/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
};
