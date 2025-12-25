import { useGetRefundStatisticsOverall } from '@/queries/eventTicket.query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, CheckCircle, Clock } from 'lucide-react';
import __helpers from '@/helpers';

export default function RefundStatistics() {
  const { data: stats, isLoading } = useGetRefundStatisticsOverall();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statisticsCards = [
    {
      title: 'Tổng số tiền cần hoàn',
      value: stats?.totalAmountNeedRefund || 0,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: `${stats?.totalTicketsNeedRefund || 0} vé`
    },
    {
      title: 'Đã hoàn tiền',
      value: stats?.totalAmountRefunded || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: `${stats?.ticketsRefunded || 0} vé`
    },
    {
      title: 'Chưa hoàn tiền',
      value: stats?.totalAmountPendingRefund || 0,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: `${stats?.ticketsPendingRefund || 0} vé`
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {statisticsCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={`${card.bgColor} p-2 rounded-lg`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color}`}>
                {__helpers.formatCurrency(card.value)} đ
              </div>
              <p className="text-xs text-gray-500 mt-1">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
