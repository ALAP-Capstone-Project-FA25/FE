import BasePages from '@/components/shared/base-pages';
import { OverViewTab } from './components/overview/index';
import { StatisticsTab } from './components/statistics/index';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PaymentPage() {
  return (
    <>
      <BasePages
        className="relative flex-1 space-y-4 overflow-y-auto px-4"
        pageHead="Quản lý hóa đơn"
        breadcrumbs={[
          { title: 'Quản lý hóa đơn', link: '/admin/orders/invoices' }
        ]}
      >
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Danh sách hóa đơn</TabsTrigger>
            <TabsTrigger value="statistics">Thống kê</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <OverViewTab />
          </TabsContent>
          <TabsContent value="statistics" className="space-y-4">
            <StatisticsTab />
          </TabsContent>
        </Tabs>
      </BasePages>
    </>
  );
}
