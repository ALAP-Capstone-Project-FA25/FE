import BasePages from '@/components/shared/base-pages.js';
import { OverViewTab } from './components/overview/index.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PackagePage() {
  return (
    <>
      <BasePages
        className="relative flex-1 space-y-4 overflow-y-auto px-4"
        pageHead="Quản lý gói học"
        breadcrumbs={[{ title: 'Quản lý gói học', link: '/admin/packages' }]}
      >
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Danh sách gói học</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <OverViewTab />
          </TabsContent>
        </Tabs>
      </BasePages>
    </>
  );
}

