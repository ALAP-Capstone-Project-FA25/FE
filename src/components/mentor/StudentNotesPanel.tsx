import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  StickyNote,
  Clock,
  FileText,
  Video,
  ChevronDown,
  ChevronUp,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Note } from '@/pages/LearningPage/types';

interface StudentNote extends Note {
  lessonTitle?: string;
  lessonType?: 'video' | 'document';
  page?: number; // for document notes
}

interface StudentNotesPanelProps {
  notes: StudentNote[];
  isLoading?: boolean;
  onNoteClick?: (note: StudentNote) => void;
  className?: string;
}

export default function StudentNotesPanel({
  notes,
  isLoading = false,
  onNoteClick,
  className
}: StudentNotesPanelProps) {
  const [sortBy, setSortBy] = useState<'time' | 'lesson'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins} phút trước`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)} giờ trước`;
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  const sortedNotes = [...notes].sort((a, b) => {
    let comparison = 0;

    if (sortBy === 'time') {
      comparison =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      comparison = (a.lessonTitle || '').localeCompare(b.lessonTitle || '');
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleNoteExpansion = (noteId: string) => {
    setExpandedNotes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  const handleNoteClick = (note: StudentNote) => {
    if (onNoteClick) {
      onNoteClick(note);
    }
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-center">
          <StickyNote className="mx-auto h-8 w-8 animate-pulse text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">Đang tải ghi chú...</p>
        </div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-center">
          <StickyNote className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">
            Học viên chưa có ghi chú nào
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Header with sorting controls */}
      <div className="border-b bg-gray-50 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-gray-800">
              Ghi chú học viên ({notes.length})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (sortBy === 'time') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy('time');
                  setSortOrder('desc');
                }
              }}
              className="h-7 text-xs"
            >
              <Clock className="mr-1 h-3 w-3" />
              Thời gian
              {sortBy === 'time' &&
                (sortOrder === 'desc' ? (
                  <ChevronDown className="ml-1 h-3 w-3" />
                ) : (
                  <ChevronUp className="ml-1 h-3 w-3" />
                ))}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (sortBy === 'lesson') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy('lesson');
                  setSortOrder('asc');
                }
              }}
              className="h-7 text-xs"
            >
              <FileText className="mr-1 h-3 w-3" />
              Bài học
              {sortBy === 'lesson' &&
                (sortOrder === 'desc' ? (
                  <ChevronDown className="ml-1 h-3 w-3" />
                ) : (
                  <ChevronUp className="ml-1 h-3 w-3" />
                ))}
            </Button>
          </div>
        </div>
      </div>

      {/* Notes list */}
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-3">
          {sortedNotes.map((note) => {
            const isExpanded = expandedNotes.has(note.id);
            const isLongNote = note.text.length > 100;
            const displayText =
              isExpanded || !isLongNote
                ? note.text
                : note.text.substring(0, 100) + '...';

            return (
              <div
                key={note.id}
                className="group cursor-pointer rounded-lg border bg-white p-3 shadow-sm transition-all hover:shadow-md"
                onClick={() => handleNoteClick(note)}
              >
                {/* Note header */}
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    {note.lessonType === 'video' ? (
                      <Video className="h-4 w-4 flex-shrink-0 text-blue-500" />
                    ) : (
                      <FileText className="h-4 w-4 flex-shrink-0 text-green-500" />
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {note.lessonTitle || 'Bài học'}
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        {note.lessonType === 'video' &&
                          typeof note.time === 'number' && (
                            <Badge variant="secondary" className="text-xs">
                              <Clock className="mr-1 h-3 w-3" />
                              {formatTime(note.time)}
                            </Badge>
                          )}

                        {note.lessonType === 'document' && note.page && (
                          <Badge variant="secondary" className="text-xs">
                            <FileText className="mr-1 h-3 w-3" />
                            Trang {note.page}
                          </Badge>
                        )}

                        <span className="text-xs text-gray-500">
                          <Calendar className="mr-1 inline h-3 w-3" />
                          {formatDate(note.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Note content */}
                <div className="relative">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                    {displayText}
                  </p>

                  {isLongNote && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNoteExpansion(note.id);
                      }}
                      className="mt-2 h-6 p-0 text-xs text-blue-600 hover:text-blue-800"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="mr-1 h-3 w-3" />
                          Thu gọn
                        </>
                      ) : (
                        <>
                          <ChevronDown className="mr-1 h-3 w-3" />
                          Xem thêm
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Hover actions */}
                <div className="mt-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNoteClick(note);
                    }}
                    className="h-6 text-xs text-gray-500 hover:text-gray-700"
                  >
                    <MessageSquare className="mr-1 h-3 w-3" />
                    Thảo luận về ghi chú này
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
