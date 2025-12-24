'use client';
import * as React from 'react';
import { Search, BookOpen, Video, FileText, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearchAll, type SearchResult } from '@/queries/search.query';
import { useRouter } from '@/routes/hooks';
import { useDebounce } from '@/hooks/debounce';

export default function SearchDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchKeyword, setSearchKeyword] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const debouncedKeyword = useDebounce(searchKeyword, 300);
  const { data: searchResults, isLoading } = useSearchAll(
    debouncedKeyword,
    isOpen
  );

  const results: SearchResult = searchResults || {
    courses: [],
    lessons: [],
    topics: [],
    totalCount: 0
  };

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchKeyword(value);
    setIsOpen(value.length > 0);
  };

  const handleInputFocus = () => {
    if (searchKeyword.length > 0) {
      setIsOpen(true);
    }
  };

  const handleCourseClick = (courseId: number) => {
    router.push(`/course/${courseId}`);
    setIsOpen(false);
    setSearchKeyword('');
  };

  const handleLessonClick = (
    courseId: number,
    topicId: number,
    lessonId: number
  ) => {
    router.push(`/learning/${courseId}?lessonId=${lessonId}`);
    setIsOpen(false);
    setSearchKeyword('');
  };

  const handleTopicClick = (courseId: number, topicId: number) => {
    router.push(`/learning/${courseId}`);
    setIsOpen(false);
    setSearchKeyword('');
  };

  const hasResults =
    results.courses.length > 0 ||
    results.lessons.length > 0 ||
    results.topics.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          ref={inputRef}
          placeholder="Tìm kiếm khóa học, bài viết, video, ..."
          className="rounded-full border-gray-200 pl-11 pr-4"
          value={searchKeyword}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-2 max-h-[500px] overflow-hidden rounded-lg border bg-white shadow-lg dark:bg-gray-800">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            </div>
          ) : !hasResults ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              Không tìm thấy kết quả nào
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="p-2">
                {/* Courses */}
                {results.courses.length > 0 && (
                  <div className="mb-4">
                    <div className="mb-2 px-3 text-xs font-semibold uppercase text-gray-500">
                      Khóa học ({results.courses.length})
                    </div>
                    {results.courses.map((course) => (
                      <div
                        key={course.id}
                        className="flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => handleCourseClick(course.id)}
                      >
                        <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                          <BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {course.title}
                          </div>
                          {course.description && (
                            <div className="mt-1 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                              {course.description}
                            </div>
                          )}
                          {course.categoryName && (
                            <div className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                              {course.categoryName}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Lessons */}
                {results.lessons.length > 0 && (
                  <div className="mb-4">
                    <div className="mb-2 px-3 text-xs font-semibold uppercase text-gray-500">
                      Bài học ({results.lessons.length})
                    </div>
                    {results.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() =>
                          handleLessonClick(
                            lesson.courseId,
                            lesson.topicId,
                            lesson.id
                          )
                        }
                      >
                        <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                          <Video className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {lesson.title}
                          </div>
                          {lesson.description && (
                            <div className="mt-1 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                              {lesson.description}
                            </div>
                          )}
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {lesson.courseTitle} • {lesson.topicTitle}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Topics */}
                {results.topics.length > 0 && (
                  <div className="mb-4">
                    <div className="mb-2 px-3 text-xs font-semibold uppercase text-gray-500">
                      Chủ đề ({results.topics.length})
                    </div>
                    {results.topics.map((topic) => (
                      <div
                        key={topic.id}
                        className="flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() =>
                          handleTopicClick(topic.courseId, topic.id)
                        }
                      >
                        <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                          <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {topic.title}
                          </div>
                          {topic.description && (
                            <div className="mt-1 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                              {topic.description}
                            </div>
                          )}
                          {topic.courseTitle && (
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {topic.courseTitle}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  );
}
