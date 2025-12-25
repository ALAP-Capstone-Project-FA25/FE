import BasePages from '@/components/shared/base-pages';
import { OverViewTab } from './components/overview';

export default function AdminBlogPage() {
  return (
    <BasePages
      className="relative flex-1 space-y-4 overflow-y-auto px-4"
      pageHead="Quản lý Blog"
      breadcrumbs={[{ title: 'Quản lý Blog', link: '/admin/blog' }]}
    >
      <OverViewTab />
    </BasePages>
  );
}
