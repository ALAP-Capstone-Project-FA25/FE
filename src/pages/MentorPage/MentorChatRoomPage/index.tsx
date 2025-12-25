import { useState, useEffect, useRef } from 'react';
import {
  useGetListChatRoomByMentorId,
  useGetListMessageByChatRoomId,
  useSendMessageToChatroom
} from '@/queries/chatroom.query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Send,
  Search,
  Image as ImageIcon,
  Video,
  Check,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

import { useQueryClient } from '@tanstack/react-query';
import { HubConnection, HubConnectionState } from '@microsoft/signalr';
import { createChatConnection } from '@/lib/signalr';
import meetService from '@/services/meet.service';
import SingleFileUpload from '@/components/shared/single-file-upload';

// Import mentor components
import CourseProgressButton from '@/components/mentor/CourseProgressButton';
import StudentProgressModal from '@/components/mentor/StudentProgressModal';

enum MessageType {
  TEXT = 0,
  IMAGE = 1,
  MEETING = 2
}

interface ChatRoom {
  id: number;
  name: string;
  courseId?: number;
  course?: {
    id: number;
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    salePrice: number;
    members: number;
    categoryId: number;
  };
  createdBy: {
    id: number;
    firstName: string;
    lastName: string;
    avatar: string;
    username: string;
    email: string;
  };
  createdById: number;
  participantId: number;
  participant: {
    id: number;
    firstName: string;
    lastName: string;
    avatar: string;
    username: string;
    email: string;
  };
  createdAt: string;
  messages?: Array<{
    id: number;
    content: string;
    isUser: boolean;
    isRead: boolean;
    messageType: MessageType;
    messageLink: string;
    chatRoomId: number;
    createdAt: string;
  }>;
  // Computed fields
  lastMessage?: {
    id: number;
    content: string;
    createdAt: string;
    isRead: boolean;
    messageType: MessageType;
    isUser: boolean;
  };
  hasUnreadMessages?: boolean;
}

export default function MentorChatRoomPage() {
  const { data: rawChatRooms } = useGetListChatRoomByMentorId();

  // Process chat rooms with real data from API
  const chatRooms = rawChatRooms
    ?.map((room: ChatRoom) => {
      // Get last message from messages array
      const lastMessage =
        room.messages && room.messages.length > 0
          ? room.messages[room.messages.length - 1]
          : null;

      // Check if there are unread messages from student
      const hasUnreadMessages =
        room.messages?.some((msg) => msg.isUser && !msg.isRead) || false;

      return {
        ...room,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
              isRead: lastMessage.isRead,
              messageType: lastMessage.messageType,
              isUser: lastMessage.isUser
            }
          : undefined,
        hasUnreadMessages
      };
    })
    ?.sort((a, b) => {
      // Sort by last message time, most recent first
      const aTime = a.lastMessage?.createdAt || a.createdAt;
      const bTime = b.lastMessage?.createdAt || b.createdAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  const { data: messages } = useGetListMessageByChatRoomId(selectedRoomId || 0);

  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showMeetingConfirm, setShowMeetingConfirm] = useState(false);

  // Progress modal state
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{
    id: number;
    name: string;
    courseId: number;
    courseName: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();
  const connectionRef = useRef<HubConnection | null>(null);

  const [isStudentTyping, setIsStudentTyping] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-select first chat room when data loads
  useEffect(() => {
    if (chatRooms && chatRooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(chatRooms[0].id);
    }
  }, [chatRooms, selectedRoomId]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, selectedRoomId]);

  const handleSelectRoom = async (roomId: number) => {
    setSelectedRoomId(roomId);
    setShowMeetingConfirm(false);
    setShowImageUpload(false);

    // Mark messages as read when selecting room (fallback handling)
    queryClient.setQueryData(
      ['get-list-chat-room-by-mentor-id'],
      (old: ChatRoom[]) => {
        if (!old) return old;
        return old.map((room) =>
          room.id === roomId ? { ...room, hasUnreadMessages: false } : room
        );
      }
    );
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

  const handleImageUploaded = async (fileUrl: string) => {
    if (!fileUrl || !selectedRoomId) return;

    try {
      // Send image message
      await handleSendMessage(MessageType.IMAGE, fileUrl);
      setShowImageUpload(false);

      toast({
        title: 'Thành công',
        description: 'Đã gửi ảnh'
      });
    } catch (error: any) {
      console.error('Lỗi khi gửi ảnh:', error);
      toast({
        title: 'Lỗi',
        description: error?.message || 'Không thể gửi ảnh',
        variant: 'destructive'
      });
    }
  };

  const handleSendMeeting = async () => {
    try {
      // Gọi API để tạo link meet thật
      const meetingLink = await meetService.quickMeet();

      await handleSendMessage(MessageType.MEETING, meetingLink);
      setShowMeetingConfirm(false);

      toast({
        title: 'Thành công',
        description: 'Đã tạo và gửi link meeting'
      });
    } catch (error: any) {
      console.error('Error generating meet link:', error);
      toast({
        title: 'Lỗi',
        description: error?.message || 'Không thể tạo Meet link',
        variant: 'destructive'
      });
    }
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
            className="max-h-60 w-full rounded-lg object-contain"
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              target.parentElement!.innerHTML +=
                '<div class="rounded-lg bg-gray-200 p-4 text-center text-sm text-gray-600">Không thể tải ảnh</div>';
            }}
          />
          <a
            href={message.content}
            target="_blank"
            rel="noopener noreferrer"
            className={`block text-xs transition-colors hover:underline ${
              !message.isUser ? 'text-blue-200' : 'text-gray-600'
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
        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-lg bg-white/10 p-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <Video className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {!message.isUser ? 'Mentor' : 'Học viên'} đã gửi link meeting
              </p>
            </div>
          </div>
          <a
            href={message.content}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              !message.isUser
                ? 'bg-white/20 text-white hover:bg-white/30'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <Video className="h-4 w-4" />
            Tham gia meeting
          </a>
        </div>
      );
    }

    // TEXT type (default)
    return (
      <div className="whitespace-pre-wrap break-words">{message.content}</div>
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
      return formatTime(dateString); // Show time for today
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  const getLastMessagePreview = (lastMessage: any) => {
    if (!lastMessage) return 'Chưa có tin nhắn';

    switch (lastMessage.messageType) {
      case MessageType.IMAGE:
        return '📷 Hình ảnh';
      case MessageType.MEETING:
        return '📹 Cuộc gọi video';
      case MessageType.TEXT:
      default:
        const prefix = !lastMessage.isUser ? 'Bạn: ' : '';
        const content =
          lastMessage.content.length > 30
            ? lastMessage.content.substring(0, 30) + '...'
            : lastMessage.content;
        return prefix + content;
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
      room.course?.title?.toLowerCase().includes(q)
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

          // Update messages list
          queryClient.setQueryData(
            ['get-list-message-by-chat-room-id', roomId],
            (old: any) => {
              if (!old) return [dto];
              return [...old, dto];
            }
          );

          // Update chat rooms list with new last message
          queryClient.setQueryData(
            ['get-list-chat-room-by-mentor-id'],
            (old: ChatRoom[]) => {
              if (!old) return old;
              return old
                .map((room) => {
                  if (room.id === dto.chatRoomId) {
                    // Add new message to messages array
                    const updatedMessages = [
                      ...(room.messages || []),
                      {
                        id: dto.id,
                        content: dto.content,
                        isUser: dto.isUser,
                        isRead: dto.isRead || false,
                        messageType: dto.messageType || MessageType.TEXT,
                        messageLink: dto.messageLink || '',
                        chatRoomId: dto.chatRoomId,
                        createdAt: dto.createdAt
                      }
                    ];

                    return {
                      ...room,
                      messages: updatedMessages,
                      lastMessage: {
                        id: dto.id,
                        content: dto.content,
                        createdAt: dto.createdAt,
                        isRead: dto.isRead || false,
                        messageType: dto.messageType || MessageType.TEXT,
                        isUser: dto.isUser || false
                      },
                      hasUnreadMessages:
                        dto.isUser && room.id !== selectedRoomId // Only mark unread if from student and not current room
                    };
                  }
                  return room;
                })
                .sort((a, b) => {
                  // Re-sort by last message time
                  const aTime = a.lastMessage?.createdAt || a.createdAt;
                  const bTime = b.lastMessage?.createdAt || b.createdAt;
                  return new Date(bTime).getTime() - new Date(aTime).getTime();
                });
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

  const handleViewProgress = (room: ChatRoom) => {
    const courseId = room.courseId || room.course?.id;

    if (!courseId || courseId === undefined) {
      console.error('CourseId is missing or undefined for room:', room);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể xem tiến độ: Phòng chat chưa được gán khóa học'
      });
      return;
    }

    setSelectedStudent({
      id: room.createdBy.id || room.createdById,
      name: `${room.createdBy.firstName} ${room.createdBy.lastName}`,
      courseId: courseId,
      courseName: room.course?.title || 'Khóa học'
    });
    setShowProgressModal(true);
  };

  const handleBackToChat = () => {
    setShowProgressModal(false);
    setSelectedStudent(null);
  };

  // ========== RENDER ==========

  return (
    <div className="flex h-[calc(100vh-10px)] overflow-hidden bg-white">
      {/* Messenger-style Sidebar */}
      <div className="flex w-80 flex-col border-r border-gray-200 bg-white">
        {/* Messenger Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
          <div className="flex gap-2">
            <button className="rounded-full p-2 transition-colors hover:bg-gray-100">
              <svg
                className="h-5 w-5 text-gray-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Tìm kiếm trong Messenger"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border-0 bg-gray-100 py-2 pl-10 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-blue-500"
            />
          </div>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1">
          <div className="px-2">
            {filteredRooms?.map((room: ChatRoom) => (
              <button
                key={room.id}
                onClick={() => handleSelectRoom(room.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-gray-100',
                  selectedRoomId === room.id && 'bg-blue-50 hover:bg-blue-100'
                )}
              >
                <div className="relative">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={room.createdBy.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 font-semibold text-white">
                      {room.createdBy.firstName[0]}
                      {room.createdBy.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online status - green dot */}
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500"></div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <p
                      className={cn(
                        'truncate',
                        room.hasUnreadMessages
                          ? 'font-bold text-gray-900'
                          : 'font-semibold text-gray-900'
                      )}
                    >
                      {room.createdBy.firstName} {room.createdBy.lastName}
                    </p>
                    <span className="text-xs text-gray-500">
                      {room.lastMessage
                        ? formatDate(room.lastMessage.createdAt)
                        : formatDate(room.createdAt)}
                    </span>
                  </div>

                  {/* Course tag */}
                  <div className="mb-2">
                    <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      📚 {room.course?.title || 'Chưa có khóa học'}
                    </span>
                  </div>

                  {/* Last message preview */}
                  <p
                    className={cn(
                      'truncate text-sm',
                      room.hasUnreadMessages
                        ? 'font-semibold text-gray-900'
                        : 'text-gray-500'
                    )}
                  >
                    {getLastMessagePreview(room.lastMessage)}
                  </p>
                </div>

                {/* Unread indicator - only show if has unread messages */}
                {room.hasUnreadMessages && (
                  <div className="h-3 w-3 flex-shrink-0 rounded-full bg-blue-500"></div>
                )}
              </button>
            ))}

            {/* Empty state */}
            {(!filteredRooms || filteredRooms.length === 0) && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">
                  {searchQuery
                    ? 'Không tìm thấy cuộc trò chuyện'
                    : 'Chưa có tin nhắn nào'}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Messenger-style Chat Area */}
      <div className="flex flex-1 flex-col bg-white">
        {selectedRoom ? (
          <>
            {/* Messenger Chat Header - Clean & Minimal */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedRoom.createdBy.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 font-semibold text-white">
                      {selectedRoom.createdBy.firstName[0]}
                      {selectedRoom.createdBy.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedRoom.createdBy.firstName}{' '}
                    {selectedRoom.createdBy.lastName}
                  </h3>
                  <p className="text-sm text-green-600">
                    {isStudentTyping ? 'Đang nhập...' : 'Đang hoạt động'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Progress button - moved to header actions */}
                {(selectedRoom.courseId || selectedRoom.course?.id) && (
                  <CourseProgressButton
                    courseTitle={selectedRoom.course?.title || 'Khóa học'}
                    studentId={
                      selectedRoom.createdBy?.id || selectedRoom.createdById
                    }
                    courseId={
                      selectedRoom.courseId || selectedRoom.course?.id || 0
                    }
                    studentName={`${selectedRoom.createdBy.firstName} ${selectedRoom.createdBy.lastName}`}
                    onClick={() => handleViewProgress(selectedRoom)}
                    className="rounded-full border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100"
                  />
                )}

                {/* Info button */}
                <button className="rounded-full p-2 transition-colors hover:bg-gray-100">
                  <svg
                    className="h-5 w-5 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messenger-style Messages Area */}
            <ScrollArea className="flex-1 bg-gray-50" ref={scrollAreaRef}>
              <div className="space-y-2 p-4">
                {messages && messages.length > 0 ? (
                  <>
                    {messages?.map((message: any, index: number) => {
                      const isConsecutive =
                        index > 0 &&
                        messages[index - 1]?.isUser === message.isUser &&
                        new Date(message.createdAt).getTime() -
                          new Date(messages[index - 1]?.createdAt).getTime() <
                          300000; // 5 minutes

                      return (
                        <div
                          key={message.id}
                          className={cn(
                            'flex gap-2',
                            !message.isUser ? 'justify-end' : 'justify-start'
                          )}
                        >
                          {/* Avatar for student messages */}
                          {message.isUser && !isConsecutive && (
                            <Avatar className="mt-1 h-7 w-7 flex-shrink-0">
                              <AvatarImage
                                src={selectedRoom.createdBy.avatar}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-medium text-white">
                                {selectedRoom.createdBy.firstName[0]}
                              </AvatarFallback>
                            </Avatar>
                          )}

                          {/* Spacer for consecutive messages */}
                          {message.isUser && isConsecutive && (
                            <div className="w-7"></div>
                          )}

                          <div
                            className={cn(
                              'group max-w-[70%]',
                              isConsecutive ? 'mt-1' : 'mt-0'
                            )}
                          >
                            {/* Message bubble - Messenger style */}
                            <div
                              className={cn(
                                'relative rounded-2xl px-3 py-2',
                                !message.isUser
                                  ? 'ml-auto bg-blue-500 text-white' // Mentor messages - blue like Messenger
                                  : 'bg-gray-200 text-gray-900', // Student messages - gray
                                // Tail styling
                                !isConsecutive &&
                                  !message.isUser &&
                                  'rounded-br-md',
                                !isConsecutive &&
                                  message.isUser &&
                                  'rounded-bl-md'
                              )}
                            >
                              {/* Message content */}
                              {renderMessageContent(message)}
                            </div>

                            {/* Timestamp - only show on hover or for last message */}
                            <div
                              className={cn(
                                'mt-1 px-2 text-xs text-gray-500 opacity-0 transition-opacity group-hover:opacity-100',
                                index === messages.length - 1 && 'opacity-100',
                                !message.isUser && 'text-right'
                              )}
                            >
                              {formatTime(message.createdAt)}
                              {!message.isUser && (
                                <Check className="ml-1 inline h-3 w-3" />
                              )}
                            </div>
                          </div>

                          {/* Avatar for mentor messages */}
                          {!message.isUser && !isConsecutive && (
                            <Avatar className="mt-1 h-7 w-7 flex-shrink-0">
                              <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-xs font-medium text-white">
                                M
                              </AvatarFallback>
                            </Avatar>
                          )}

                          {/* Spacer for consecutive mentor messages */}
                          {!message.isUser && isConsecutive && (
                            <div className="w-7"></div>
                          )}
                        </div>
                      );
                    })}

                    {/* Typing indicator - Messenger style */}
                    {isStudentTyping && (
                      <div className="flex justify-start gap-2">
                        <Avatar className="mt-1 h-7 w-7 flex-shrink-0">
                          <AvatarImage src={selectedRoom.createdBy.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-medium text-white">
                            {selectedRoom.createdBy.firstName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="rounded-2xl rounded-bl-md bg-gray-200 px-4 py-2">
                          <div className="flex items-center gap-1">
                            <div className="flex gap-1">
                              <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.3s]"></div>
                              <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.15s]"></div>
                              <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                      <Send className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-800">
                      Bắt đầu cuộc trò chuyện
                    </h3>
                    <p className="max-w-xs text-gray-600">
                      Gửi tin nhắn đầu tiên để hỗ trợ học viên trong khóa học
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Image Upload Modal */}
            {showImageUpload && (
              <div className="border-t border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-blue-500" />
                    <h4 className="font-medium text-gray-900">Upload ảnh</h4>
                  </div>
                  <button
                    onClick={() => setShowImageUpload(false)}
                    className="rounded-lg p-1 transition-colors hover:bg-gray-100"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <SingleFileUpload
                    onFileUploaded={handleImageUploaded}
                    acceptedFileTypes={['image/*']}
                    maxFileSize={5}
                    autoUpload={true}
                    placeholder="Kéo thả ảnh hoặc click để chọn"
                  />
                </div>
              </div>
            )}

            {/* Messenger-style Meeting Confirmation */}
            {showMeetingConfirm && (
              <div className="border-t border-gray-200 bg-white p-4">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
                      <Video className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Tạo cuộc gọi video
                      </h4>
                      <p className="text-sm text-gray-600">
                        Gửi link Google Meet cho học viên
                      </p>
                    </div>
                  </div>

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
                      className="flex-1 bg-blue-500 text-white hover:bg-blue-600"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Gửi link
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Messenger-style Input area */}
            <div className="border-t border-gray-200 bg-white p-4">
              <div className="flex items-end gap-3">
                {/* Attachment buttons */}
                <div className="flex gap-1">
                  {/* Image Upload Button */}
                  <button
                    onClick={() => setShowImageUpload(!showImageUpload)}
                    disabled={!selectedRoomId}
                    className="rounded-full p-2 transition-colors hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ImageIcon className="h-5 w-5 text-blue-500" />
                  </button>

                  {/* Meeting Button */}
                  <button
                    onClick={() => setShowMeetingConfirm(true)}
                    disabled={!selectedRoomId}
                    className="rounded-full p-2 transition-colors hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Video className="h-5 w-5 text-blue-500" />
                  </button>
                </div>

                {/* Message input */}
                <div className="relative flex-1">
                  <Input
                    placeholder="Aa"
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
                    className="rounded-full border-0 border-gray-300 bg-gray-100 px-4 py-2 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-blue-500"
                  />
                </div>

                {/* Send button */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!messageInput.trim()}
                  className={cn(
                    'rounded-full p-2 transition-all',
                    messageInput.trim()
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'cursor-not-allowed text-gray-400'
                  )}
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>

              {/* Quick replies - Messenger style */}
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {[
                  '👋 Chào bạn!',
                  '❓ Cần hỗ trợ gì không?',
                  '📚 Hãy xem bài học này',
                  '✅ Tốt lắm!',
                  '💪 Cố gắng nhé!'
                ].map((quickReply, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setMessageInput(quickReply);
                    }}
                    className="flex-shrink-0 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-200"
                  >
                    {quickReply}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center bg-gray-50">
            <div className="max-w-md px-6 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                <Send className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-800">
                Chọn cuộc trò chuyện
              </h3>
              <p className="mb-4 leading-relaxed text-gray-600">
                Chọn một học viên từ danh sách để bắt đầu hỗ trợ và trò chuyện
              </p>
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="text-sm text-gray-500">
                  💡 <strong>Mẹo:</strong> Sử dụng thanh tìm kiếm để nhanh chóng
                  tìm học viên
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Student Progress Modal */}
      {selectedStudent && (
        <StudentProgressModal
          isOpen={showProgressModal}
          onClose={() => setShowProgressModal(false)}
          studentId={selectedStudent.id}
          courseId={selectedStudent.courseId}
          studentName={selectedStudent.name}
          courseName={selectedStudent.courseName}
          onBackToChat={handleBackToChat}
        />
      )}
    </div>
  );
}
