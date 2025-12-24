'use client';
import * as React from 'react';
import { Bell, Check, CheckCheck, Trash2, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  useGetNotifications,
  useGetUnreadNotificationCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  type NotificationDto,
  NotificationType
} from '@/queries/notification.query';
import { useRouter } from '@/routes/hooks';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.PAYMENT_SUCCESS:
    case NotificationType.PACKAGE_PURCHASE_SUCCESS:
    case NotificationType.EVENT_TICKET_PURCHASE_SUCCESS:
      return '💳';
    case NotificationType.KNOWLEDGE_REINFORCEMENT:
      return '📚';
    case NotificationType.EVENT_UPCOMING:
    case NotificationType.EVENT_STARTED:
    case NotificationType.EVENT_ENDED:
      return '📅';
    case NotificationType.MENTOR_MESSAGE:
      return '💬';
    case NotificationType.REFUND_PROCESSED:
      return '💰';
    case NotificationType.ACCOUNT_REGISTERED:
    case NotificationType.ACCOUNT_VERIFIED:
      return '✅';
    default:
      return '🔔';
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case NotificationType.PAYMENT_SUCCESS:
    case NotificationType.PACKAGE_PURCHASE_SUCCESS:
    case NotificationType.EVENT_TICKET_PURCHASE_SUCCESS:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case NotificationType.KNOWLEDGE_REINFORCEMENT:
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case NotificationType.EVENT_UPCOMING:
    case NotificationType.EVENT_STARTED:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case NotificationType.EVENT_ENDED:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    case NotificationType.MENTOR_MESSAGE:
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case NotificationType.REFUND_PROCESSED:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
};

export default function NotificationDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);

  const { data: unreadCount = 0 } = useGetUnreadNotificationCount();
  const { data: notificationsData, isLoading } = useGetNotifications({
    pageNumber: 1,
    pageSize: 20
  });

  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();

  const notifications = notificationsData?.listObjects || [];

  const handleNotificationClick = (notification: NotificationDto) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }

    if (notification.linkUrl) {
      router.push(notification.linkUrl);
      setIsOpen(false);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    deleteNotification.mutate(id);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5 text-gray-600 hover:text-orange-500" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 p-0 text-xs text-white"
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Thông báo</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0 sm:w-[420px]">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Thông báo</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="mb-2 h-12 w-12 text-gray-400" />
              <p className="text-sm text-gray-500">Không có thông báo nào</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative cursor-pointer px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    !notification.isRead
                      ? 'bg-orange-50 dark:bg-orange-950/20'
                      : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-lg ${getNotificationColor(
                        notification.type
                      )}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm font-medium ${
                            !notification.isRead
                              ? 'text-gray-900 dark:text-gray-100'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="h-2 w-2 flex-shrink-0 rounded-full bg-orange-500" />
                        )}
                      </div>
                      {notification.message && (
                        <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
                          {notification.message}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                              locale: vi
                            }
                          )}
                        </span>
                        {notification.linkUrl && (
                          <ExternalLink className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 gap-1">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead.mutate(notification.id);
                          }}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-400 hover:text-red-500"
                        onClick={(e) => handleDelete(e, notification.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              className="w-full text-xs"
              onClick={() => {
                router.push('/profile');
                setIsOpen(false);
              }}
            >
              Xem tất cả thông báo
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
