import { X, Send, Loader2, MessageSquare } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Note } from './types';
import { formatTime } from './utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && note) {
      // Tự động thêm câu hỏi đầu tiên khi mở dialog
      const initialMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: `Tại thời điểm ${formatTime(note.time)}, tôi có ghi chú: "${note.text}". Bạn có thể giải thích rõ hơn về phần này không?`,
        timestamp: new Date()
      };
      setMessages([initialMessage]);

      // Giả lập response từ AI (bạn sẽ thay bằng API thật)
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            'Chào bạn! Tôi đã nhận được ghi chú của bạn. Bạn muốn tôi giải thích cụ thể điểm nào trong phần này?',
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, aiResponse]);
      }, 1000);

      // Focus vào input
      setTimeout(() => inputRef.current?.focus(), 100);
    } else if (!isOpen) {
      setMessages([]);
      setInput('');
    }
  }, [isOpen, note]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Giả lập API call (thay bằng API thật của bạn)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'Đây là câu trả lời mẫu từ AI. Bạn cần tích hợp với API thật để nhận được câu trả lời chính xác.',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
              <h3 className="font-semibold text-white">Nhắn với mentor</h3>
              {note && (
                <p className="mt-0.5 text-xs text-gray-400">
                  Ghi chú tại {formatTime(note.time)}
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

        {/* Context Info */}
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
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20'
                    : 'border border-gray-700 bg-gray-800 text-gray-100'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </p>
                <p
                  className={`mt-2 text-xs ${
                    message.role === 'user'
                      ? 'text-orange-100'
                      : 'text-gray-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-gray-700 bg-gray-800 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
                  <span className="text-sm text-gray-400">
                    Đang suy nghĩ...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-800 bg-gray-900/50 p-4">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập câu hỏi của bạn..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              style={{ minHeight: '44px', maxHeight: '120px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = '44px';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
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
