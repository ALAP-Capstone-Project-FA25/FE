import { useState, useEffect, useRef } from 'react';
import {
  useGetListChatRoomByMentorId,
  useGetListMessageByChatRoomId,
  useSendMessageToChatroom
} from '@/queries/chatroom.query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Send,
  Search,
  Clock,
  Image as ImageIcon,
  Video,
  Loader2,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

import { useQueryClient } from '@tanstack/react-query';
import { HubConnection, HubConnectionState } from '@microsoft/signalr';
import { createChatConnection } from '@/lib/signalr';
import BaseRequest from '@/config/axios.config';

enum MessageType {
  TEXT = 0,
  IMAGE = 1,
  MEETING = 2
}

interface ChatRoom {
  id: number;
  name: string;
  course: {
    title: string;
    imageUrl: string;
  };
  createdBy: {
    firstName: string;
    lastName: string;
    avatar: string;
  };
  createdAt: string;
}

export default function MentorChatRoomPage() {
  const { data: chatRooms } = useGetListChatRoomByMentorId();
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  const { data: messages } = useGetListMessageByChatRoomId(selectedRoomId || 0);

  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showMeetingConfirm, setShowMeetingConfirm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const connectionRef = useRef<HubConnection | null>(null);

  const [isStudentTyping, setIsStudentTyping] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, selectedRoomId]);

  const handleSelectRoom = async (roomId: number) => {
    setSelectedRoomId(roomId);
    setShowMeetingConfirm(false);
  };

  const { mutateAsync: sendMessageToChatroom } = useSendMessageToChatroom();

  const handleSendMessage = async (
    messageType: MessageType = MessageType.TEXT,
    content?: string
  ) => {
    const messageContent = content || messageInput.trim();
    if (!messageContent || !selectedRoomId) return;

    if (messageType === MessageType.TEXT) {
      setMessageInput('');
    }

    const [err] = await sendMessageToChatroom({
      id: 0,
      chatRoomId: selectedRoomId,
      content: messageContent,
      isUser: false,
      messageType: messageType,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    if (err) {
      toast({
        title: 'Lỗi',
        description: err.message || 'Có lỗi xảy ra',
        variant: 'destructive'
      });
      return;
    }

    setTimeout(scrollToBottom, 100);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Lỗi',
        description: 'Chỉ chấp nhận file ảnh',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Lỗi',
        description: 'Kích thước file không được vượt quá 5MB',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const [error, response] = await BaseRequest.Post('/upload', formData);

      if (error) {
        throw new Error(error?.message || 'Upload failed');
      }

      const fileUrl = response?.downloadUrl;
      if (!fileUrl) {
        throw new Error('No file URL returned');
      }

      // Send image message
      await handleSendMessage(MessageType.IMAGE, fileUrl);

      toast({
        title: 'Thành công',
        description: 'Đã gửi ảnh'
      });
    } catch (error: any) {
      console.error('Lỗi khi upload ảnh:', error);
      toast({
        title: 'Lỗi',
        description: error?.message || 'Không thể upload ảnh',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSendMeeting = async () => {
    // Generate a quick meeting link
    const meetingLink = `https://meet.google.com/${generateMeetingId()}`;

    await handleSendMessage(MessageType.MEETING, meetingLink);
    setShowMeetingConfirm(false);

    toast({
      title: 'Thành công',
      description: 'Đã gửi link meeting'
    });
  };

  const generateMeetingId = () => {
    // Generate random meeting ID
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let id = '';
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      if (i < 2) id += '-';
    }
    return id;
  };

  const renderMessageContent = (message: any) => {
    // Debug log
    console.log(
      'Message:',
      message.id,
      'Type:',
      message.messageType,
      'Content:',
      message.content
    );

    // Check messageType - có thể là number hoặc string từ backend
    const msgType =
      typeof message.messageType === 'number'
        ? message.messageType
        : parseInt(message.messageType as any) || 0;

    console.log('Parsed msgType:', msgType);

    // IMAGE type
    if (msgType === MessageType.IMAGE || msgType === 1) {
      return (
        <div className="space-y-2">
          <img
            src={message.content}
            alt="Uploaded image"
            className="max-h-80 w-full rounded-lg object-contain"
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              target.parentElement!.innerHTML +=
                '<div class="rounded-lg bg-gray-700 p-4 text-center text-sm text-gray-400">Không thể tải ảnh</div>';
            }}
          />
          <a
            href={message.content}
            target="_blank"
            rel="noopener noreferrer"
            className={`block text-xs transition-colors hover:underline ${
              !message.isUser ? 'text-orange-200' : 'text-blue-400'
            }`}
          >
            🔗 Xem ảnh gốc
          </a>
        </div>
      );
    }

    // MEETING type
    if (msgType === MessageType.MEETING || msgType === 2) {
      return (
        <div className="space-y-3">
          <div
            className={`flex items-start gap-3 rounded-lg p-3 ${
              !message.isUser
                ? 'bg-white/10'
                : 'border border-blue-500/20 bg-blue-500/10'
            }`}
          >
            <div
              className={`rounded-lg p-2 ${
                !message.isUser ? 'bg-white/10' : 'bg-blue-500/20'
              }`}
            >
              <Video
                className={`h-5 w-5 ${
                  !message.isUser ? 'text-white' : 'text-blue-400'
                }`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1.5 text-sm font-medium">
                {!message.isUser
                  ? 'Mentor đã gửi link meeting'
                  : 'Học viên đã gửi link meeting'}
              </p>
              <a
                href={message.content}
                target="_blank"
                rel="noopener noreferrer"
                className={`block break-all font-mono text-xs transition-colors ${
                  !message.isUser
                    ? 'text-orange-100 hover:text-white hover:underline'
                    : 'text-blue-400 hover:text-blue-300 hover:underline'
                }`}
              >
                {message.content}
              </a>
            </div>
          </div>
          <a
            href={message.content}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              !message.isUser
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600'
            }`}
          >
            <Video className="h-4 w-4" />
            Tham gia meeting ngay
          </a>
        </div>
      );
    }

    // TEXT type (default)
    return (
      <div className="whitespace-pre-wrap break-words text-sm">
        {message.content}
      </div>
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  const filteredRooms = chatRooms?.filter((room: ChatRoom) => {
    const fullName = (
      room.createdBy.firstName +
      ' ' +
      room.createdBy.lastName
    ).toLowerCase();
    const q = searchQuery.toLowerCase();
    return (
      room.createdBy.firstName.toLowerCase().includes(q) ||
      room.createdBy.lastName.toLowerCase().includes(q) ||
      fullName.includes(q) ||
      room.course.title.toLowerCase().includes(q)
    );
  });

  const selectedRoom = chatRooms?.find(
    (room: ChatRoom) => room.id === selectedRoomId
  );

  // ========== SIGNALR: KẾT NỐI HUB + TYPING ==========

  useEffect(() => {
    if (!selectedRoomId) return;

    const roomId = selectedRoomId;
    const connection = createChatConnection();
    connectionRef.current = connection;

    const start = async () => {
      try {
        await connection.start();
        console.log('SignalR connected (mentor)');

        await connection.invoke('JoinRoom', roomId.toString());
        console.log('Joined room', roomId);

        // Tin nhắn mới
        connection.on('ReceiveMessage', (dto: any) => {
          console.log('ReceiveMessage (mentor)', dto);
          queryClient.setQueryData(
            ['get-list-message-by-chat-room-id', roomId],
            (old: any) => {
              if (!old) return [dto];
              return [...old, dto];
            }
          );
        });

        connection.on('MessageUpdated', (dto: any) => {
          console.log('MessageUpdated (mentor)', dto);
          queryClient.setQueryData(
            ['get-list-message-by-chat-room-id', roomId],
            (old: any) => {
              if (!old) return [];
              return old.map((m: any) => (m.id === dto.id ? dto : m));
            }
          );
        });

        // Xóa tin nhắn
        connection.on('MessageDeleted', (id: number) => {
          console.log('MessageDeleted (mentor)', id);
          queryClient.setQueryData(
            ['get-list-message-by-chat-room-id', roomId],
            (old: any) => {
              if (!old) return [];
              return old.filter((m: any) => m.id !== id);
            }
          );
        });

        // Học viên đang gõ
        connection.on('Typing', ({ roomId: rId, userId }) => {
          console.log(`Student typing in room ${rId}`, userId);
          setIsStudentTyping(true);

          if (typingTimeoutRef.current) {
            window.clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = window.setTimeout(() => {
            setIsStudentTyping(false);
          }, 2000);
        });
      } catch (err) {
        console.error('SignalR error (mentor):', err);
      }
    };

    start();

    return () => {
      const stop = async () => {
        try {
          if (connection.state === HubConnectionState.Connected) {
            await connection.invoke('LeaveRoom', roomId.toString());
          }
          await connection.stop();
        } catch (err) {
          console.error('Error stopping SignalR (mentor):', err);
        }
      };
      stop();
    };
  }, [selectedRoomId, queryClient]);

  const sendTyping = () => {
    if (
      connectionRef.current &&
      connectionRef.current.state === HubConnectionState.Connected &&
      selectedRoomId
    ) {
      connectionRef.current
        .invoke('SendTyping', selectedRoomId.toString(), 0)
        .catch((err) => console.error('SendTyping error (mentor):', err));
    }
  };

  // ========== RENDER ==========

  return (
    <div className="flex h-[calc(100vh-10px)] overflow-hidden rounded-lg border bg-white shadow-sm">
      {/* Sidebar - Danh sách chat rooms */}
      <div className="flex w-80 flex-col border-r bg-gray-50/50">
        {/* Header */}
        <div className="border-b bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">
            Tin nhắn học viên
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Tìm kiếm học viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-gray-200 pl-9 focus-visible:ring-orange-400"
            />
          </div>
        </div>

        {/* Chat rooms list */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredRooms?.map((room: ChatRoom) => (
              <button
                key={room.id}
                onClick={() => handleSelectRoom(room.id)}
                className={cn(
                  'mb-1 w-full rounded-lg p-3 text-left transition-all duration-200 hover:bg-orange-50',
                  selectedRoomId === room.id &&
                    'border border-orange-200 bg-gradient-to-r from-orange-50 to-orange-50/50 shadow-sm'
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-11 w-11 flex-shrink-0 ring-2 ring-white">
                    <AvatarImage src={room.createdBy.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-500 font-medium text-white">
                      {room.createdBy.firstName[0]}
                      {room.createdBy.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {room.createdBy.firstName} {room.createdBy.lastName}
                      </p>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {formatDate(room.createdAt)}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-orange-200 bg-orange-50 text-xs font-normal text-orange-700"
                    >
                      {room.course.title}
                    </Badge>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col">
        {selectedRoom ? (
          <>
            {/* Chat header */}
            <div className="border-b bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-orange-100">
                  <AvatarImage src={selectedRoom.createdBy.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-500 font-medium text-white">
                    {selectedRoom.createdBy.firstName[0]}
                    {selectedRoom.createdBy.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {selectedRoom.createdBy.firstName}{' '}
                    {selectedRoom.createdBy.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedRoom.course.title}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 bg-gray-50/30" ref={scrollAreaRef}>
              <div className="space-y-4 p-4">
                {messages && messages.length > 0 ? (
                  <>
                    {messages?.map((message: any) => (
                      <div
                        key={message.id}
                        className={cn(
                          'flex',
                          !message.isUser ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm',
                            !message.isUser
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                              : 'border border-gray-100 bg-white text-gray-900'
                          )}
                        >
                          {renderMessageContent(message)}
                          <p
                            className={cn(
                              'mt-1 text-xs',
                              !message.isUser
                                ? 'text-orange-100'
                                : 'text-gray-500'
                            )}
                          >
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Học viên đang nhập */}
                    {isStudentTyping && (
                      <div className="flex justify-start">
                        <div className="rounded-2xl bg-gray-200 px-3 py-1 text-xs text-gray-600">
                          Học viên đang nhập...
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center">
                    <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
                      <Send className="h-8 w-8 text-orange-300" />
                    </div>
                    <p className="text-sm text-gray-400">
                      Chưa có tin nhắn nào
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Meeting Confirmation Dialog */}
            {showMeetingConfirm && (
              <div className="border-t bg-orange-50/50 p-4">
                <div className="rounded-xl border border-orange-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <Video className="h-5 w-5 text-blue-400" />
                    <h4 className="font-medium text-gray-800">
                      Gửi link meeting
                    </h4>
                  </div>
                  <p className="mb-4 text-sm text-gray-600">
                    Bạn có chắc muốn tạo và gửi link meeting cho học viên?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowMeetingConfirm(false)}
                      className="flex-1"
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={handleSendMeeting}
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Xác nhận
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Input area */}
            <div className="border-t bg-white p-4">
              {/* Attachment buttons */}
              <div className="mb-2 flex gap-2">
                {/* Image Upload Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || !selectedRoomId}
                  className="border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImageIcon className="h-4 w-4" />
                  )}
                </Button>

                {/* Meeting Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMeetingConfirm(true)}
                  disabled={!selectedRoomId}
                  className="border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                >
                  <Video className="h-4 w-4" />
                </Button>
              </div>

              {/* Message input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập tin nhắn..."
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    sendTyping();
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 border-gray-200 focus-visible:ring-orange-400"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!messageInput.trim()}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm transition-all hover:from-orange-600 hover:to-orange-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center bg-gray-50/30">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
                <Send className="h-8 w-8 text-orange-300" />
              </div>
              <p className="text-sm text-gray-500">
                Chọn một cuộc trò chuyện để bắt đầu
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
