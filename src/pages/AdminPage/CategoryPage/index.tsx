import BasePages from '@/components/shared/base-pages.js';
import { OverViewTab } from './components/overview/index.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Add from './components/add/index.js';
import __helpers from '@/helpers/index.js';
export default function CategoryPage() {
  return (
    <>
      <BasePages
        className="relative flex-1 space-y-4 overflow-y-auto  px-4"
        pageHead="Quản lý môn học "
        breadcrumbs={[{ title: 'Quản lý môn học', link: '/category' }]}
      >
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Danh sách môn học</TabsTrigger>
            <TabsTrigger value="add">Thêm môn học</TabsTrigger>
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
