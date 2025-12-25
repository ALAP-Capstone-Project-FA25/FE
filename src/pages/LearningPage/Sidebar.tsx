import {
  ChevronDown,
  ChevronUp,
  Play,
  Lock,
  FileText,
  Check
} from 'lucide-react';
import { Topic, Lesson, QuizItem } from './types';

export default function Sidebar({
  courseData,
  expandedSections,
  toggleSection,
  currentLesson,
  currentQuiz,
  selectLesson,
  selectQuiz
}: {
  courseData: Topic[];
  expandedSections: number[];
  toggleSection: (id: number) => void;
  currentLesson: Lesson | null;
  currentQuiz: QuizItem | null;
  selectLesson: (lesson: Lesson) => void;
  selectQuiz: (quiz: QuizItem) => void;
}) {
  console.log(courseData);

  // Tìm index của topic đang current
  const currentTopicIndex = courseData.findIndex((topic) => topic.isCurrent);

  return (
    <div className="flex w-96 flex-col border-l border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-bold text-gray-900">Nội dung khóa học</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {courseData.map((section, sectionIndex) => {
            const isTopicCompleted = sectionIndex < currentTopicIndex;
            const isTopicCurrent = section.isCurrent;

            // Tìm index của lesson đang current trong topic này
            const currentLessonIndex = section.lessons.findIndex(
              (lesson) => lesson.isCurrent
            );

            return (
              <div key={section.id} className="mb-2">
                <div
                  className="group flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center gap-2">
                    {expandedSections.includes(section.id) ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                    <div className="flex items-center gap-2">
                      {isTopicCompleted && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <span
                        className={`text-sm font-medium ${isTopicCurrent ? 'text-orange-600' : isTopicCompleted ? 'text-gray-700' : 'text-gray-900'}`}
                      >
                        {section.title}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {section.lessons.length} bài
                  </span>
                </div>

                {expandedSections.includes(section.id) && (
                  <div className="ml-2 mt-1 space-y-1">
                    {section.lessons.map((lesson, lessonIndex) => {
                      const isActive = currentLesson?.id === lesson.id;
                      const isLessonCurrent = lesson.isCurrent;

                      // Lesson được xem là completed nếu:
                      // 1. Thuộc topic đã completed (topic trước topic current)
                      // 2. Hoặc thuộc topic current nhưng là lesson trước lesson current
                      const isLessonCompleted =
                        isTopicCompleted ||
                        (isTopicCurrent && lessonIndex < currentLessonIndex);

                      // Logic mở khóa mới:
                      // 1. Nếu topic đã completed (topic trước topic current) → tất cả lessons đều unlock
                      // 2. Nếu topic current → unlock lessons trước và lesson current
                      // 3. Nếu topic chưa tới → tất cả lessons đều lock (trừ isFree)
                      let isLocked = false;
                      
                      if (isTopicCompleted) {
                        // Topic đã hoàn thành → tất cả lessons unlock
                        isLocked = false;
                      } else if (isTopicCurrent) {
                        // Topic hiện tại → unlock lessons trước và lesson current
                        isLocked = lessonIndex > currentLessonIndex && !lesson.isFree;
                      } else if (sectionIndex > currentTopicIndex) {
                        // Topic chưa tới → lock tất cả (trừ isFree)
                        isLocked = !lesson.isFree;
                      } else {
                        // Fallback: unlock
                        isLocked = false;
                      }

                      return (
                        <div
                          key={lesson.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-all ${
                            isActive
                              ? 'border-l-4 border-orange-500 bg-orange-50'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => !isLocked && selectLesson(lesson)}
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {isLocked ? (
                              <Lock className="h-5 w-5 text-gray-400" />
                            ) : isLessonCompleted ? (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            ) : isActive || isLessonCurrent ? (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500">
                                <Play className="h-3 w-3 fill-current text-white" />
                              </div>
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`mb-1 text-sm leading-snug ${
                                isActive || isLessonCurrent
                                  ? 'font-medium text-orange-600'
                                  : isLocked
                                    ? 'text-gray-400'
                                    : isLessonCompleted
                                      ? 'text-gray-700'
                                      : 'text-gray-700'
                              }`}
                            >
                              {lesson.title}
                            </p>
                            <span className="text-xs text-gray-500">
                              {lesson.duration} phút
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {section.topicQuestions &&
                      section.topicQuestions.length > 0 && (
                        <div
                          className={`flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-all ${
                            currentQuiz?.topicId === section.id
                              ? 'border-l-4 border-blue-500 bg-blue-50'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() =>
                            selectQuiz({
                              type: 'quiz',
                              topicId: section.id,
                              topicTitle: section.title,
                              questionCount: section.topicQuestions.length
                            })
                          }
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {currentQuiz?.topicId === section.id ? (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                                <FileText className="h-3 w-3 text-white" />
                              </div>
                            ) : (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-blue-400 bg-blue-50">
                                <FileText className="h-3 w-5 text-blue-500" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`mb-1 text-sm font-medium leading-snug ${
                                currentQuiz?.topicId === section.id
                                  ? 'text-blue-600'
                                  : 'text-blue-700'
                              }`}
                            >
                              Bài ôn luyện
                            </p>
                            <span className="text-xs text-gray-500">
                              {section.topicQuestions.length} câu hỏi
                            </span>
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
