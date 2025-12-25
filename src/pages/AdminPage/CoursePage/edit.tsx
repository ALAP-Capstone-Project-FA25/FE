import BasePages from '@/components/shared/base-pages';
import EditCourse from './components/edit';

export default function EditCoursePage() {
  return (
    <BasePages
      className="relative flex-1 space-y-4 overflow-y-auto px-4"
      pageHead="Chỉnh sửa khóa học"
      breadcrumbs={[
        { title: 'Quản lý khóa học', link: '/admin/courses' },
        { title: 'Chỉnh sửa khóa học', link: '/admin/courses/edit' }
      ]}
    >
      <EditCourse />
    </BasePages>
  );
}