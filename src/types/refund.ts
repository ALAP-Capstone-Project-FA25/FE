export interface RefundFilter {
  pageNumber: number;
  pageSize: number;
  eventId?: number;
  isRefunded?: boolean;
  keyword?: string;
}

export interface UpdateRefundDto {
  ticketId: number;
  refundImageUrl: string;
  isRefunded: boolean;
}

export interface RefundStatistics {
  totalTicketsNeedRefund: number;
  ticketsRefunded: number;
  ticketsPendingRefund: number;
  totalAmountNeedRefund: number;
  totalAmountRefunded: number;
}

export interface EventTicket {
  id: number;
  eventId: number;
  userId: number;
  amount: number;
  needRefund: boolean;
  isRefunded: boolean;
  refundImageUrl?: string;
  createdAt: string;
  updatedAt?: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  event: {
    id: number;
    title: string;
    startDate: string;
    endDate: string;
    imageUrls?: string;
  };
  payment?: {
    id: number;
    paymentStatus: number;
  };
}
