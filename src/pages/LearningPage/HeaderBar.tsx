import { ChevronLeft } from 'lucide-react';
import { Lesson } from './types';

export default function HeaderBar({
  percentWatched,
  currentLessonTitle,
  course
}: {
  percentWatched: number;
  currentLessonTitle?: Lesson['title'];
  course?: any;
}) {
  return (
    <header className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-3">
      <div className="flex items-center gap-4">
        <button className="rounded-lg p-2 text-white transition-colors hover:bg-gray-700">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <a
          href={`/course/${course?.courseId}`}
          className="flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 font-bold text-white">
            AP
          </div>
          <span className="font-medium text-white">
            Khóa học: {course?.title}
          </span>
        </a>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
            {percentWatched.toFixed(0)}%
          </span>
          <span className="text-gray-300">
            {currentLessonTitle ? `Đang học: ${currentLessonTitle}` : '—'}
          </span>
        </div>
      </div>
    </header>
  );
}
