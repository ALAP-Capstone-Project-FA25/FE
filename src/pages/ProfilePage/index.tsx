'use client';

import ProfileHeader from './profile-header';
import CourseCard from './course-card';
import LearningStatisticsCharts from './LearningStatisticsCharts';
import LessonRecommendationsSection from './LessonRecommendationsSection';
import { useGetProfile } from '@/queries/auth.query';
import { useMemo, useState, useCallback } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useGetAdaptiveLessonRecommendations } from '@/queries/adaptive-recommendation.query';
import { Loader2 } from 'lucide-react';
import LessonViewerSheet from '@/pages/AdaptiveRecommendations/LessonViewerSheet';
import type { AdaptiveLessonRecommendationDto } from '@/queries/adaptive-recommendation.query';
import ContributionHeatmap from './contribution-heatmap';
import { useLessonViewed } from '@/hooks/useLessonViewed';

const gradients = [
  'from-red-500 to-purple-600',
  'from-purple-600 to-blue-600',
  'from-blue-600 to-cyan-500',
  'from-yellow-400 to-orange-500',
  'from-green-500 to-teal-600',
  'from-pink-500 to-rose-600',
  'from-indigo-500 to-purple-600',
  'from-orange-500 to-red-600'
];

const icons = ['📚', '⚛️', '🎮', '⚙️', '💻', '🚀', '🎯', '📖'];

export default function Profile() {
  const { data: profile } = useGetProfile();
  const { data: lessonRecommendations, isLoading: isLoadingLessons } =
    useGetAdaptiveLessonRecommendations(true);

  const [selectedLesson, setSelectedLesson] =
    useState<AdaptiveLessonRecommendationDto | null>(null);
  const [isLessonSheetOpen, setIsLessonSheetOpen] = useState(false);

  // Track viewed lessons - mark as viewed when clicking from profile page
  const lessonIds = useMemo(
    () => (lessonRecommendations || []).map((l) => l.lessonId),
    [lessonRecommendations]
  );
  const { markAsViewed } = useLessonViewed(lessonIds);

  // Handle lesson click - mark as viewed
  const handleLessonClick = useCallback(
    (lesson: AdaptiveLessonRecommendationDto) => {
      markAsViewed(lesson.lessonId);
      setSelectedLesson(lesson);
      setIsLessonSheetOpen(true);
    },
    [markAsViewed]
  );

  // Map userCourses to Course format
  const courses = useMemo(() => {
    if (!profile?.userCourses || profile.userCourses.length === 0) {
      return [];
    }

    return profile.userCourses.map((userCourse: any, index: number) => {
      const gradientIndex = index % gradients.length;
      const iconIndex = index % icons.length;

      // Get course info from userCourse.course if available, otherwise fallback to userCourse fields
      const course = userCourse.course || {};

      return {
        id: userCourse.courseId || course.id || userCourse.id,
        title: course.title || userCourse.title || 'Khóa học',
        subtitle: course.description || userCourse.description || '',
        gradient: gradients[gradientIndex],
        icon: icons[iconIndex],
        isDone: userCourse.isDone || false,
        createdAt: userCourse.createdAt
      };
    });
  }, [profile?.userCourses]);

  return (
    <main className=" grid min-h-screen grid-cols-[30%_70%] pt-4 ">
      {/* Header Section */}
      <ProfileHeader profile={profile} />

      <div className="w-full">
        <div className="w-full">
          <ContributionHeatmap loginHistories={profile?.loginHistories} />
        </div>
        {/* Tabs Section */}
        <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <Tabs defaultValue="analysis" className="w-full">
            <TabsContent value="analysis" className="mt-0">
              {isLoadingLessons ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[60%_40%]">
                  {/* 60% - Bài học đề xuất */}
                  <div>
                    <LessonRecommendationsSection
                      lessonRecommendations={lessonRecommendations || []}
                      onLessonClick={handleLessonClick}
                    />
                  </div>

                  {/* 40% - Phân tích kết quả học tập */}
                  <div>
                    <LearningStatisticsCharts />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="courses" className="mt-0">
              <div className="mb-8 flex items-center gap-2">
                <span className="text-xl">📚</span>
                <h2 className="text-2xl font-bold text-gray-900">
                  Khóa học đã đăng ký ({courses.length})
                </h2>
              </div>

              {courses.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                  <p className="text-lg text-gray-500">
                    Chưa có khóa học nào được đăng ký
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>

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
      </div>
    </main>
  );
}
