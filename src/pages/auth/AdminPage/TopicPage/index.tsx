import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverViewTab } from './components/overview';
import Add from './components/add';
import BasePages from '@/components/shared/base-pages';

export default function TopicPage() {
  return (
    <BasePages
      className="relative flex-1 space-y-4 overflow-y-auto  px-4"
      pageHead="Quản lý khóa học "
      breadcrumbs={[
        { title: 'Quản lý khóa học', link: '/admin/courses' },
        { title: 'Quản lý chủ đề', link: '/course/:id/topic' }
      ]}
    >
      <Tabs defaultValue="overview">
        <TabsList className="grid max-w-xs grid-cols-2">
          <TabsTrigger value="overview">Danh sách</TabsTrigger>
          <TabsTrigger value="add">Thêm mới</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverViewTab />
        </TabsContent>
        <TabsContent value="add">
          <Add />
        </TabsContent>
      </Tabs>
    </BasePages>
  );
}
