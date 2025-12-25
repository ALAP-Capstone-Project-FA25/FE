import { User, BookOpen, ChevronLeft } from 'lucide-react';
import { Lesson } from './types';

export default function HeaderBar({
  percentWatched,
  currentLessonTitle
}: {
  percentWatched: number;
  currentLessonTitle?: Lesson['title'];
}) {
  return (
    <header className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-3">
      <div className="flex items-center gap-4">
        <button className="rounded-lg p-2 text-white transition-colors hover:bg-gray-700">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 font-bold text-white">
            AP
          </div>
          <span className="font-medium text-white">Kiến Thức Nhập Môn</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
            {percentWatched}%
          </span>
          <span className="text-gray-300">
            {currentLessonTitle ? `Đang học: ${currentLessonTitle}` : '—'}
          </span>
        </div>
        <button className="rounded-lg px-4 py-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white">
          <User className="mr-2 inline h-4 w-4" />
          Ghi chú
        </button>
        <button className="rounded-lg px-4 py-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white">
          <BookOpen className="mr-2 inline h-4 w-4" />
          Hướng dẫn
        </button>
      </div>
    </header>
  );
}
