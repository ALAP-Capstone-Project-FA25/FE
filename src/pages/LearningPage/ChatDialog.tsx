import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Loader2,
  MessageSquare,
  Image as ImageIcon,
  Video,
  Check
} from 'lucide-react';
import { Note } from './types';
import {
  useGetChatroomByCourseAndUser,
  useSendMessageToChatroom
} from '@/queries/chatroom.query';
import { useParams } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { HubConnection, HubConnectionState } from '@microsoft/signalr';
import { createChatConnection } from '@/lib/signalr';
import meetService from '@/services/meet.service';
import { MeetStatus } from '@/components/meet/MeetStatus';
import SingleFileUpload from '@/components/shared/single-file-upload';

enum MessageType {
  TEXT = 0,
  IMAGE = 1,
  MEETING = 2
}

interface Message {
  id: number;
  content: string;
  isUser: boolean;
  isRead: boolean;
  messageType: MessageType;
  createdAt: string;
}

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
  lessonTitle?: string;
}

export default function ChatDialog({
  isOpen,
  onClose,
  note,
  lessonTitle
}: ChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showMeetingConfirm, setShowMeetingConfirm] = useState(false);
  const [isGeneratingMeet, setIsGeneratingMeet] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { id } = useParams();

  const connectionRef = useRef<HubConnection | null>(null);

  const [isMentorTyping, setIsMentorTyping] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);

  const { data: chatroomData, isLoading: isChatroomLoading } =
    useGetChatroomByCourseAndUser(id ? parseInt(id) : 0);
  const { mutateAsync: sendMessageToChatroom } = useSendMessageToChatroom();

  useEffect(() => {
    if (isOpen && chatroomData?.messages) {
      setMessages(chatroomData.messages);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else if (!isOpen) {
      setMessages([]);
      setInput('');
      setShowMeetingConfirm(false);
      setShowImageUpload(false);
    }
  }, [isOpen, chatroomData]);

  useEffect(() => {
    if (!isOpen || !chatroomData?.id) return;

    const roomId = chatroomData.id;
    const connection = createChatConnection();
    connectionRef.current = connection;

    const start = async () => {
      try {
        await connection.start();
        console.log('SignalR connected (user dialog)');

        await connection.invoke('JoinRoom', roomId.toString());
        console.log('Joined room', roomId);

        connection.on('ReceiveMessage', (dto: Message) => {
          console.log('ReceiveMessage (user)', dto);
          setMessages((prev) => [...prev, dto]);
        });

        connection.on('MessageUpdated', (dto: Message) => {
          console.log('MessageUpdated (user)', dto);
          setMessages((prev) => prev.map((m) => (m.id === dto.id ? dto : m)));
        });

        connection.on('MessageDeleted', (id: number) => {
          console.log('MessageDeleted (user)', id);
          setMessages((prev) => prev.filter((m) => m.id !== id));
        });

        connection.on('Typing', ({ roomId: rId, userId }) => {
          console.log(`Mentor typing in room ${rId}`, userId);
          setIsMentorTyping(true);

          if (typingTimeoutRef.current) {
            window.clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = window.setTimeout(() => {
            setIsMentorTyping(false);
          }, 2000);
        });
      } catch (err) {
        console.error('SignalR error (user dialog):', err);
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
          console.error('Error stopping SignalR (user):', err);
        }
      };
      stop();
    };
  }, [isOpen, chatroomData?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (
    messageType: MessageType = MessageType.TEXT,
    content?: string
  ) => {
    const messageContent = content || input.trim();
    if (!messageContent || isLoading || !chatroomData?.id) return;

    if (messageType === MessageType.TEXT) {
      setInput('');
    }
    setIsLoading(true);

    try {
      const [err] = await sendMessageToChatroom({
        id: 0,
        chatRoomId: chatroomData.id,
        content: messageContent,
        isUser: true,
        messageType: messageType,
        isRead: true,
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
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUploaded = async (fileUrl: string) => {
    if (!fileUrl || !chatroomData?.id) return;

    try {
      // Send image message
      await handleSend(MessageType.IMAGE, fileUrl);
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
    setIsGeneratingMeet(true);

    try {
      // Sử dụng Meet service để tạo link thật
      const meetingLink = await meetService.generateMeetLink();

      await handleSend(MessageType.MEETING, meetingLink);
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
    } finally {
      setIsGeneratingMeet(false);
    }
  };

  const handleQuickMeeting = async () => {
    setIsGeneratingMeet(true);

    try {
      // Tạo Meet link nhanh mà không cần confirm
      const meetingLink = await meetService.generateMeetLink();

      await handleSend(MessageType.MEETING, meetingLink);

      toast({
        title: 'Thành công',
        description: 'Đã tạo và gửi Meet link nhanh'
      });
    } catch (error: any) {
      console.error('Error generating quick meet link:', error);
      toast({
        title: 'Lỗi',
        description: error?.message || 'Không thể tạo Meet link',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingMeet(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sendTyping = () => {
    if (
      connectionRef.current &&
      connectionRef.current.state === HubConnectionState.Connected &&
      chatroomData?.id
    ) {
      connectionRef.current
        .invoke('SendTyping', chatroomData.id.toString(), 0)
        .catch((err) => console.error('SendTyping error (user):', err));
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
    setInput(note?.text || '');
  }, [note]);

  const renderMessageContent = (message: Message) => {
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
              message.isUser ? 'text-orange-200' : 'text-blue-400'
            }`}
          >
            🔗 Xem ảnh gốc
          </a>
        </div>
      );
    }

    // MEETING type
    if (msgType === MessageType.MEETING || msgType === 2) {
      return <MeetStatus meetLink={message.content} isUser={message.isUser} />;
    }

    return (
      <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
        {message.content}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed bottom-6 right-6 top-20 z-50 flex w-[440px] flex-col rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-900 to-gray-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 bg-gradient-to-r from-orange-500/10 to-transparent p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-500/20 p-2">
              <MessageSquare className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                {chatroomData?.name || 'Nhắn với mentor'}
              </h3>
              {chatroomData?.course && (
                <p className="mt-0.5 text-xs text-gray-400">
                  {chatroomData.course.title}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="group rounded-lg p-2 transition-colors hover:bg-gray-800"
          >
            <X className="h-5 w-5 text-gray-400 group-hover:text-white" />
          </button>
        </div>

        {/* Context Info - Hiển thị khi có note */}
        {note && (
          <div className="border-b border-gray-800 bg-gradient-to-r from-orange-500/5 to-transparent p-4">
            <div className="flex items-start gap-3">
              <div className="rounded bg-orange-500/20 p-1.5">
                <MessageSquare className="h-4 w-4 text-orange-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-xs font-medium text-gray-400">
                  Ghi chú của bạn:
                </p>
                <p className="text-sm italic text-gray-200">"{note.text}"</p>
                {lessonTitle && (
                  <p className="mt-2 text-xs text-gray-500">📚 {lessonTitle}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {isChatroomLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="mb-3 h-12 w-12 text-gray-700" />
              <p className="text-sm text-gray-400">Chưa có tin nhắn nào</p>
              <p className="mt-1 text-xs text-gray-500">
                Hãy bắt đầu cuộc trò chuyện với mentor
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.isUser
                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20'
                        : 'border border-gray-700 bg-gray-800 text-gray-100'
                    }`}
                  >
                    {renderMessageContent(message)}
                    <p
                      className={`mt-2 text-xs ${
                        message.isUser ? 'text-orange-100' : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Mentor đang nhập */}
              {isMentorTyping && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-gray-700 bg-gray-800 px-3 py-2">
                    <span className="text-xs text-gray-400">
                      Mentor đang nhập...
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {isLoading && (
            <div className="flex justify-end">
              <div className="rounded-2xl border border-gray-700 bg-gray-800 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
                  <span className="text-sm text-gray-400">Đang gửi...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Meeting Confirmation Dialog */}
        {showMeetingConfirm && (
          <div className="border-t border-gray-800 bg-gray-900/80 p-4">
            <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Video className="h-5 w-5 text-blue-400" />
                <h4 className="font-medium text-white">Gửi link meeting</h4>
              </div>
              <p className="mb-4 text-sm text-gray-400">
                Hệ thống sẽ tạo một Google Meet link mới và gửi cho mentor. Link
                này có thể được sử dụng ngay lập tức.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowMeetingConfirm(false)}
                  className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSendMeeting}
                  disabled={isLoading || isGeneratingMeet}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="flex items-center justify-center gap-2">
                    {isGeneratingMeet ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    {isGeneratingMeet ? 'Đang tạo...' : 'Xác nhận'}
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Upload Modal */}
        {showImageUpload && (
          <div className="border-t border-gray-800 bg-gray-900/80 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-orange-400" />
                <h4 className="font-medium text-white">Upload ảnh</h4>
              </div>
              <button
                onClick={() => setShowImageUpload(false)}
                className="rounded-lg p-1 transition-colors hover:bg-gray-800"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
              <div className="[&_.bg-blue-500]:!bg-orange-500 [&_.bg-blue-50]:!bg-gray-700/50 [&_.border-gray-300]:!border-gray-600 [&_.border-gray-400]:!border-gray-500 [&_.text-gray-400]:!text-gray-400 [&_.text-gray-500]:!text-gray-400 [&_.text-gray-600]:!text-gray-300 [&_.text-gray-900]:!text-gray-100">
                <SingleFileUpload
                  onFileUploaded={handleImageUploaded}
                  acceptedFileTypes={['image/*']}
                  maxFileSize={5}
                  autoUpload={true}
                  placeholder="Kéo thả ảnh hoặc click để chọn"
                />
              </div>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-800 bg-gray-900/50 p-4">
          <div className="mb-2 flex gap-2">
            {/* Image Upload Button */}
            <button
              onClick={() => setShowImageUpload(!showImageUpload)}
              disabled={isLoading || isGeneratingMeet || !chatroomData?.id}
              className="rounded-lg border border-gray-700 bg-gray-800 p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              title="Upload ảnh"
            >
              <ImageIcon className="h-5 w-5" />
            </button>

            {/* Quick Meeting Button */}
            <button
              onClick={handleQuickMeeting}
              disabled={isLoading || isGeneratingMeet || !chatroomData?.id}
              className="rounded-lg border border-blue-600/50 bg-blue-600/10 p-2 text-blue-400 transition-colors hover:bg-blue-600/20 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
              title="Tạo Meet link nhanh"
            >
              {isGeneratingMeet ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Video className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                sendTyping();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi của bạn... (hỗ trợ Markdown)"
              rows={1}
              disabled={isLoading || !chatroomData?.id}
              className="flex-1 resize-none rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ minHeight: '44px', maxHeight: '120px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = '44px';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading || !chatroomData?.id}
              className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 px-4 py-3 text-white shadow-lg shadow-orange-500/20 transition-all hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-500/30 disabled:cursor-not-allowed disabled:from-gray-700 disabled:to-gray-800 disabled:shadow-none"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-gray-500">
            Nhấn Enter để gửi, Shift + Enter để xuống dòng
          </p>
        </div>
      </div>
    </>
  );
}
