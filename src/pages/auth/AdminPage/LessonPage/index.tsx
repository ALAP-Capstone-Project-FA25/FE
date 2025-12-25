import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverViewTab } from './components/overview';
import Add from './components/add';
import BasePages from '@/components/shared/base-pages';
import ExamManagement from './components/exam';
import { useParams } from 'react-router-dom';

export default function LessonPage() {
  const { courseId, topicId } = useParams<{
    courseId: string;
    topicId: string;
  }>();
  return (
    <BasePages
      className="relative flex-1 space-y-4 overflow-y-auto  px-4"
      pageHead="Quản lý khóa học "
      breadcrumbs={[
        { title: 'Quản lý bài học', link: '/admin/courses' },
        { title: 'Quản lý chủ đề', link: `/admin/courses/${courseId}/topics` },
        {
          title: 'Quản lý bài học',
          link: `/admin/courses/${courseId}/topics/${topicId}/lessons`
        }
      ]}
    >
      <Tabs defaultValue="overview">
        <TabsList className="grid max-w-xs grid-cols-3">
          <TabsTrigger value="overview">Bài học</TabsTrigger>
          <TabsTrigger value="add">Thêm bài học</TabsTrigger>
          <TabsTrigger value="test">Bài kiểm tra</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverViewTab />
        </TabsContent>
        <TabsContent value="add">
          <Add />
        </TabsContent>
        <TabsContent value="test">
          <ExamManagement />
        </TabsContent>
      </Tabs>
    </BasePages>
  );
}
