import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useState } from 'react';
import { Lesson, Note } from './types';
import { formatTime } from './utils';
import NotesList from './NotesList';
import ChatDialog from './ChatDialog';

export default function LessonInfo({
  currentLesson,
  currentQuizTitle,
  currentQuizCount,
  currentTime,
  onAddNote,
  durationMinutes,
  percentWatched,
  content,
  notes,
  onJumpNote,
  onDeleteNote,
  onPrevLesson,
  onNextLesson,
  onAskNote
}: {
  currentLesson: Lesson | null;
  currentQuizTitle?: string;
  currentQuizCount?: number;
  currentTime: number;
  onAddNote: () => void;
  durationMinutes?: number;
  percentWatched: number;
  content?: string;
  notes: Note[];
  onJumpNote: (time: number) => void;
  onDeleteNote: (id: string) => void;
  onPrevLesson: () => void;
  onNextLesson: () => void;
  onAskNote: (note: Note) => void;
}) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const handleAddNote = () => {
    onAddNote();
    // Giả sử onAddNote tạo note mới, ta cần lấy note đó
    // Tạm thời tạo note mẫu để demo
    const newNote: Note = {
      id: Date.now().toString(),
      time: Math.floor(currentTime),
      text: 'Chưa hiểu đoạn này lắm',
      createdAt: new Date().toISOString()
    };
    setSelectedNote(newNote);
  };

  const handleAskNote = (note: Note) => {
    setSelectedNote(note);
    setIsChatOpen(true);
    onAskNote(note);
  };

  return (
    <>
      <div className="border-t border-gray-800 bg-gray-900 p-6">
        <div className="max-w-4xl">
          <h1 className="mb-3 text-2xl font-bold text-white">
            {currentQuizTitle
              ? `Bài Ôn Luyện - ${currentQuizTitle}`
              : currentLesson?.title || 'Chọn bài học để bắt đầu'}
          </h1>
          <p className="mb-4 text-sm text-gray-400">
            {currentQuizTitle
              ? `${currentQuizCount} câu hỏi trắc nghiệm`
              : currentLesson?.description || 'Mô tả bài học sẽ hiển thị ở đây'}
          </p>

          {!currentQuizTitle && (
            <>
              <div className="mb-6 flex items-center gap-4">
                <button
                  className="rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-white shadow-lg shadow-orange-500/20 transition-all hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-500/30"
                  onClick={handleAddNote}
                >
                  <Clock className="mr-2 inline h-4 w-4" />
                  Thêm ghi chú tại {formatTime(Math.floor(currentTime))}
                </button>
                {typeof durationMinutes === 'number' && (
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                    {durationMinutes} phút
                  </span>
                )}
                <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                  Đã xem ~ {percentWatched}%
                </span>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="mb-4 text-gray-300">
                  {content || 'Nội dung bài học sẽ hiển thị ở đây'}
                </p>
              </div>

              <div className="mt-6">
                <h3 className="mb-2 text-sm font-semibold text-gray-200">
                  Ghi chú của bạn
                </h3>
                <NotesList
                  notes={notes}
                  onJump={onJumpNote}
                  onDelete={onDeleteNote}
                  onAsk={handleAskNote}
                />
              </div>

              <div className="mt-8 flex items-center gap-4 border-t border-gray-800 pt-6">
                <button
                  className="rounded-lg border border-gray-700 bg-gray-800 px-6 py-2 text-gray-300 transition-colors hover:bg-gray-700"
                  onClick={onPrevLesson}
                >
                  <ChevronLeft className="mr-2 inline h-4 w-4" />
                  BÀI TRƯỚC
                </button>
                <button
                  className="rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-2 text-white shadow-lg shadow-orange-500/20 transition-all hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-500/30"
                  onClick={onNextLesson}
                >
                  BÀI TIẾP THEO
                  <ChevronRight className="ml-2 inline h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div
        className="fixed bottom-0 right-0 w-[250px] p-4"
        onClick={() => setIsChatOpen(true)}
      >
        <button className="w-full rounded-full bg-orange-500 py-3 font-semibold text-white transition-colors hover:bg-orange-600">
          Hỏi đáp
        </button>
      </div>
      <ChatDialog
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        note={selectedNote}
        lessonTitle={currentLesson?.title}
      />
    </>
  );
}
