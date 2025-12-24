import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { HubConnection } from '@microsoft/signalr';
import { createChatConnection } from '@/lib/signalr';

export function useChatHub(
  selectedRoomId: number | null,
  accessToken?: string
) {
  const queryClient = useQueryClient();
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    if (!selectedRoomId) return;

    const connection = createChatConnection(accessToken);
    connectionRef.current = connection;

    const start = async () => {
      try {
        await connection.start();
        console.log('SignalR connected');

        await connection.invoke('JoinRoom', selectedRoomId.toString());
        console.log('Joined room', selectedRoomId);

        // === HANDLERS ===

        // Tin nhắn mới
        connection.on('ReceiveMessage', (dto: any) => {
          console.log('ReceiveMessage', dto);
          queryClient.setQueryData(
            ['get-list-message-by-chat-room-id', selectedRoomId],
            (old: any) => {
              if (!old) return [dto];
              return [...old, dto];
            }
          );
        });

        // Cập nhật tin nhắn
        connection.on('MessageUpdated', (dto: any) => {
          console.log('MessageUpdated', dto);
          queryClient.setQueryData(
            ['get-list-message-by-chat-room-id', selectedRoomId],
            (old: any) => {
              if (!old) return [];
              return old.map((m: any) => (m.id === dto.id ? dto : m));
            }
          );
        });

        // Xóa tin nhắn
        connection.on('MessageDeleted', (id: number) => {
          console.log('MessageDeleted', id);
          queryClient.setQueryData(
            ['get-list-message-by-chat-room-id', selectedRoomId],
            (old: any) => {
              if (!old) return [];
              return old.filter((m: any) => m.id !== id);
            }
          );
        });

        // Đang nhập
        connection.on('Typing', ({ roomId, userId }) => {
          console.log(`User ${userId} đang nhập trong room ${roomId}`);
          // Nếu bạn muốn hiển thị "đang nhập..." thì có thể dùng 1 state khác ở đây
        });
      } catch (err) {
        console.error('SignalR error:', err);
      }
    };

    start();

    // cleanup khi đổi room hoặc unmount
    return () => {
      const stop = async () => {
        try {
          if (connection.state === 'Connected') {
            await connection.invoke('LeaveRoom', selectedRoomId.toString());
          }
          await connection.stop();
        } catch (err) {
          console.error('Error stopping SignalR:', err);
        }
      };
      stop();
    };
  }, [selectedRoomId, accessToken, queryClient]);

  const sendTyping = () => {
    if (
      connectionRef.current &&
      connectionRef.current.state === 'Connected' &&
      selectedRoomId
    ) {
      // TODO: truyền userId thật, ở đây tạm để 0
      connectionRef.current
        .invoke('SendTyping', selectedRoomId.toString(), 0)
        .catch((err) => console.error(err));
    }
  };

  return { sendTyping };
}
