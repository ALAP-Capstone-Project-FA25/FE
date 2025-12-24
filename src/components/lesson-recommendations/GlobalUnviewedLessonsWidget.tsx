'use client';
import { useMemo, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useGetAdaptiveLessonRecommendations } from '@/queries/adaptive-recommendation.query';
import { useLessonViewed } from '@/hooks/useLessonViewed';
import UnviewedLessonsWidget from './UnviewedLessonsWidget';
import LessonViewerSheet from '@/pages/AdaptiveRecommendations/LessonViewerSheet';
import type { AdaptiveLessonRecommendationDto } from '@/queries/adaptive-recommendation.query';

export default function GlobalUnviewedLessonsWidget() {
  const location = useLocation();
  const { data: lessonRecommendations } =
    useGetAdaptiveLessonRecommendations(true);

  const [selectedLesson, setSelectedLesson] =
    useState<AdaptiveLessonRecommendationDto | null>(null);
  const [isLessonSheetOpen, setIsLessonSheetOpen] = useState(false);

  // Check if current route is admin route
  const isAdminRoute = useMemo(() => {
    return location.pathname.startsWith('/admin');
  }, [location.pathname]);

  // Track viewed lessons
  const lessonIds = useMemo(
    () => (lessonRecommendations || []).map((l) => l.lessonId),
    [lessonRecommendations]
  );
  const { markAsViewed, getUnviewedLessons } = useLessonViewed(lessonIds);

  // Get unviewed lessons
  const unviewedLessons = useMemo(() => {
    if (!lessonRecommendations) return [];
    const unviewedIds = getUnviewedLessons(lessonIds);
    return lessonRecommendations.filter((l) =>
      unviewedIds.includes(l.lessonId)
    );
  }, [lessonRecommendations, lessonIds, getUnviewedLessons]);

  // Handle lesson click - mark as viewed
  const handleLessonClick = useCallback(
    (lesson: AdaptiveLessonRecommendationDto) => {
      markAsViewed(lesson.lessonId);
      setSelectedLesson(lesson);
      setIsLessonSheetOpen(true);
    },
    [markAsViewed]
  );

  // Don't show widget on admin routes
  if (isAdminRoute) {
    return null;
  }

  return (
    <>
      <UnviewedLessonsWidget
        unviewedLessons={unviewedLessons}
        onLessonClick={handleLessonClick}
      />
      {/* Lesson Viewer Sheet */}
      {selectedLesson && (
        <LessonViewerSheet
          open={isLessonSheetOpen}
          onOpenChange={setIsLessonSheetOpen}
          lessonId={selectedLesson.lessonId}
          lessonTitle={selectedLesson.lessonTitle}
          lessonDescription={selectedLesson.lessonDescription}
          lessonVideoUrl={selectedLesson.lessonVideoUrl}
          lessonType={selectedLesson.lessonType}
          courseTitle={selectedLesson.courseTitle}
          topicTitle={selectedLesson.topicTitle}
        />
      )}
    </>
  );
}
