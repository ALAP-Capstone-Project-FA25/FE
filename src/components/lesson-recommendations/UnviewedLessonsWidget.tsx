'use client';
import * as React from 'react';
import { Megaphone } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from '@/routes/hooks';
import type { AdaptiveLessonRecommendationDto } from '@/queries/adaptive-recommendation.query';
import { Video, Star, ExternalLink } from 'lucide-react';

interface UnviewedLessonsWidgetProps {
  unviewedLessons: AdaptiveLessonRecommendationDto[];
  onLessonClick: (lesson: AdaptiveLessonRecommendationDto) => void;
}

export default function UnviewedLessonsWidget({
  unviewedLessons,
  onLessonClick
}: UnviewedLessonsWidgetProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    // Inject animation styles
    const styleId = 'unviewed-lessons-widget-animation';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes shake-widget {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px) rotate(-3deg); }
          20%, 40%, 60%, 80% { transform: translateX(4px) rotate(3deg); }
        }
        .shake-widget-animation {
          animation: shake-widget 1.5s ease-in-out infinite;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Return null after all hooks
  if (unviewedLessons.length === 0) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-blue-500 text-white shadow-lg transition-all hover:scale-110 hover:bg-blue-600"
          size="icon"
        >
          <div className="shake-widget-animation relative">
            <Megaphone className="h-6 w-6" />
            <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 p-0 text-xs text-white">
              {unviewedLessons.length}
            </Badge>
          </div>
          <span className="sr-only">Bài học chưa xem</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Gợi Ý Củng Cố Kiến Thức</SheetTitle>
          <SheetDescription>
            Bạn có {unviewedLessons.length} bài học được đề xuất để củng cố kiến
            thức
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {unviewedLessons.map((lesson) => (
            <Card
              key={lesson.lessonId}
              className="transition-all hover:shadow-md"
            >
              <CardHeader>
                <div className="mb-2 flex items-center justify-between">
                  <Badge className="bg-orange-500 text-white">
                    <Video className="mr-1 h-3 w-3" />
                    Video đề xuất
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
                    <span className="text-sm font-medium">
                      {lesson.recommendationScore}
                    </span>
                  </div>
                </div>
                <CardTitle className="line-clamp-2 text-base">
                  {lesson.lessonTitle}
                </CardTitle>
                <p className="mt-1 text-xs text-gray-500">
                  {lesson.courseTitle} • {lesson.topicTitle}
                </p>
              </CardHeader>
              <CardContent>
                <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                  {lesson.lessonDescription}
                </p>

                <div className="mb-3 space-y-1 rounded-lg bg-orange-50 p-2">
                  <p className="text-xs font-medium text-orange-900">
                    {lesson.recommendationReason}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-orange-700">
                    <span>{lesson.referralCount} câu hỏi sai</span>
                    <span>Độ thành thạo: {lesson.masteryLevel}/5</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-orange-500 text-sm text-white"
                    onClick={() => {
                      onLessonClick(lesson);
                      setIsOpen(false);
                    }}
                  >
                    <Video className="mr-2 h-3 w-3" />
                    Xem Bài Học
                  </Button>
                  <Button
                    variant="outline"
                    className="text-sm"
                    onClick={() => {
                      router.push('/profile');
                      setIsOpen(false);
                    }}
                  >
                    <ExternalLink className="mr-2 h-3 w-3" />
                    Chi Tiết
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6">
          <Button
            className="w-full"
            variant="outline"
            onClick={() => {
              router.push('/profile');
              setIsOpen(false);
            }}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Xem Tất Cả Trong Profile
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
