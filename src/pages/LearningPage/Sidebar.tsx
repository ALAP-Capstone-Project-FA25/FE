import { ChevronDown, ChevronUp, Play, Lock, FileText } from 'lucide-react';
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
  return (
    <div className="flex w-96 flex-col border-l border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-bold text-gray-900">Nội dung khóa học</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {courseData.map((section) => (
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
                  <span className="text-sm font-medium text-gray-900">
                    {section.title}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {section.lessons.length} bài
                </span>
              </div>

              {expandedSections.includes(section.id) && (
                <div className="ml-2 mt-1 space-y-1">
                  {section.lessons.map((lesson) => {
                    const isActive = currentLesson?.id === lesson.id;
                    const isLocked = !lesson.isFree;
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
                          ) : isActive ? (
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
                              isActive
                                ? 'font-medium text-orange-600'
                                : isLocked
                                  ? 'text-gray-400'
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
                              <FileText className="h-3 w-3 text-blue-500" />
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
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 p-4">
        <button className="w-full rounded-full bg-orange-500 py-3 font-semibold text-white transition-colors hover:bg-orange-600">
          Hỏi đáp
        </button>
      </div>
    </div>
  );
}
