import { useEffect, useRef, useState } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { FileText, ExternalLink, Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LessonType } from '@/types/api.types';
import { getYouTubeVideoId } from '@/pages/LearningPage/utils';
import { useGetLessonById } from '@/queries/lesson.query';

interface LessonViewerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId: number;
  lessonTitle?: string;
  lessonType?: number;
  lessonVideoUrl?: string;
  lessonDescription?: string;
  courseTitle?: string;
  topicTitle?: string;
}

export default function LessonViewerSheet({
  open,
  onOpenChange,
  lessonId,
  lessonTitle: initialLessonTitle,
  lessonType: initialLessonType,
  lessonVideoUrl: initialLessonVideoUrl,
  lessonDescription: initialLessonDescription,
  courseTitle,
  topicTitle
}: LessonViewerSheetProps) {
  const playerRef = useRef<any>(null);
  const [videoId, setVideoId] = useState<string>('');

  // Fetch lesson data if needed
  const { data: lessonData, isLoading: isLoadingLesson } = useGetLessonById(
    open ? lessonId : 0
  );

  const lesson = lessonData;
  const lessonTitle = lesson?.title || initialLessonTitle || '';
  const lessonType =
    lesson?.lessonType || initialLessonType || LessonType.VIDEO;
  const lessonVideoUrl = lesson?.videoUrl || initialLessonVideoUrl || '';
  const lessonDescription =
    lesson?.description || initialLessonDescription || '';
  const documentUrl = lesson?.documentUrl;
  const documentContent = lesson?.documentContent;

  useEffect(() => {
    if (lessonType === LessonType.VIDEO && lessonVideoUrl) {
      setVideoId(getYouTubeVideoId(lessonVideoUrl));
    } else {
      setVideoId('');
    }
  }, [lessonType, lessonVideoUrl]);

  const onPlayerReady: YouTubeProps['onReady'] = (e) => {
    playerRef.current = e.target;
  };

  const onStateChange: YouTubeProps['onStateChange'] = () => {};

  const renderContent = () => {
    if (lessonType === LessonType.DOCUMENT) {
      if (documentUrl) {
        return (
          <div className="flex h-full flex-col">
            <Card className="flex-1">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {lessonTitle}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(documentUrl, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Mở trong tab mới
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <iframe
                  src={documentUrl}
                  className="h-[calc(100vh-300px)] w-full"
                  title={lessonTitle}
                />
              </CardContent>
            </Card>
          </div>
        );
      }

      if (documentContent) {
        return (
          <div className="flex h-full flex-col">
            <Card className="flex-1">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {lessonTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none p-6">
                <div
                  className="ql-editor"
                  dangerouslySetInnerHTML={{ __html: documentContent }}
                />
              </CardContent>
            </Card>
          </div>
        );
      }

      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <FileText className="mx-auto h-16 w-16 text-gray-600" />
            <p className="mt-4 text-gray-400">Không có nội dung tài liệu</p>
          </div>
        </div>
      );
    }

    // VIDEO type
    if (videoId) {
      return (
        <div className="flex h-full flex-col bg-black">
          <div className="flex flex-1 items-center justify-center p-4">
            <div className="aspect-video w-full max-w-5xl">
              <YouTube
                videoId={videoId}
                opts={{
                  width: '100%',
                  height: '100%',
                  playerVars: {
                    autoplay: 0,
                    controls: 1,
                    rel: 0
                  }
                }}
                onReady={onPlayerReady}
                onStateChange={onStateChange}
                className="h-full w-full"
                iframeClassName="w-full h-full"
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Không có video</p>
        </div>
      </div>
    );
  };

  if (isLoadingLesson) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto p-0 sm:max-w-4xl"
        >
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-y-auto p-0 sm:max-w-4xl"
      >
        <SheetHeader className="flex-shrink-0 border-b px-6 pb-4 pt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-xl">{lessonTitle}</SheetTitle>
              {(courseTitle || topicTitle) && (
                <p className="mt-1 text-sm text-gray-500">
                  {courseTitle && topicTitle
                    ? `${courseTitle} • ${topicTitle}`
                    : courseTitle || topicTitle}
                </p>
              )}
              {lessonDescription && (
                <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                  {lessonDescription}
                </p>
              )}
            </div>
          </div>
        </SheetHeader>
        <div
          className="flex-1 overflow-auto"
          style={{ height: 'calc(100vh - 120px)' }}
        >
          {renderContent()}
        </div>
      </SheetContent>
    </Sheet>
  );
}
