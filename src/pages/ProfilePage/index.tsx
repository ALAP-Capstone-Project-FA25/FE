'use client';

import ProfileHeader from './profile-header';
import ContributionHeatmap from './contribution-heatmap';
import CourseCard from './course-card';
import { useGetProfile } from '@/queries/auth.query';
import { useMemo } from 'react';

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

  // Map userCourses to Course format
  const courses = useMemo(() => {
    if (!profile?.userCourses || profile.userCourses.length === 0) {
      return [];
    }

    return profile.userCourses.map((userCourse: any, index: number) => {
      const gradientIndex = index % gradients.length;
      const iconIndex = index % icons.length;

      return {
        id: userCourse.courseId || userCourse.id,
        title: userCourse.title || 'Khóa học',
        subtitle: userCourse.description || '',
        gradient: gradients[gradientIndex],
        icon: icons[iconIndex],

        createdAt: userCourse.createdAt
      };
    });
  }, [profile?.userCourses]);

  return (
    <main className="min-h-screen bg-white">
      {/* Header Section */}
      <ProfileHeader profile={profile} />

      {/* Contribution Heatmap Section */}
      <section className="border-t border-gray-200 bg-gray-50 py-12">
        <ContributionHeatmap loginHistories={profile?.loginHistories} />
      </section>

      {/* Courses Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
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
      </section>
    </main>
  );
}
