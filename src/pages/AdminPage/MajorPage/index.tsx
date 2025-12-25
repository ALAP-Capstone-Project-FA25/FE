import BasePages from '@/components/shared/base-pages';
import { OverViewTab } from './components/overview/index';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Add from './components/add/index';

export default function MajorPage() {
  return (
    <>
      <BasePages
        className="relative flex-1 space-y-4 overflow-y-auto px-4"
        pageHead="Quản lý nhóm môn học"
        breadcrumbs={[{ title: 'Quản lý nhóm môn học', link: '/admin/majors' }]}
      >
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Danh sách nhóm môn học</TabsTrigger>
            <TabsTrigger value="add">Thêm nhóm môn học</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <OverViewTab />
          </TabsContent>
          <TabsContent value="add" className="space-y-4">
            <Add />
          </TabsContent>
        </Tabs>
      </BasePages>
    </>
  );
}
