import BaseRequest from '@/config/axios.config';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useGetChatroomByCourseAndUser(courseId: number) {
  return useQuery({
    queryKey: ['chatrooms', courseId],
    queryFn: () => {
      return BaseRequest.Get(
        `/api/ChatRoom/get-chat-room-by-course-and-user-id?courseId=${courseId}`
      );
    },
    enabled: !!courseId && courseId !== undefined && !isNaN(courseId)
  });
}

export const useSendMessageToChatroom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['send-message-to-chatroom'],
    mutationFn: (data: any) => {
      return BaseRequest.Post('/api/ChatRoomMessage/create-update', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatrooms'] });
      queryClient.invalidateQueries({
        queryKey: ['get-list-message-by-chat-room-id']
      });
    }
  });
};

export const useGetListChatRoomByMentorId = () => {
  return useQuery({
    queryKey: ['get-list-chat-room-by-mentor-id'],
    queryFn: () => {
      return BaseRequest.Get(`/api/ChatRoom/get-list-by-mentor-id`);
    }
  });
};

export const useGetListMessageByChatRoomId = (chatRoomId: any) => {
  return useQuery({
    queryKey: ['get-list-message-by-chat-room-id', chatRoomId],
    queryFn: () => {
      return BaseRequest.Get(
        `/api/ChatRoomMessage/get-by-chatroom/${chatRoomId}`
      );
    },
    enabled: !!chatRoomId
  });
};
