'use client';

import { Star, Users, Eye, Clock } from 'lucide-react';
import { useRouter } from '@/routes/hooks';
import { formatDate } from 'date-fns';
import __helpers from '@/helpers';

interface CourseStats {
  learners: string;
  rating: string;
  views: string;
  duration: string;
}

interface Course {
  id: number;
  title: string;
  subtitle: string;
  gradient: string;
  icon: string;
  stats: CourseStats;
  isFree: boolean;
}

export default function CourseCard({ course }: { course: any }) {
  console.log(course);
  const router = useRouter();
  return (
    <div className="overflow-hidden rounded-xl shadow-md transition-shadow hover:shadow-xl">
      {/* Card Header with Gradient */}
      <div
        className={`bg-gradient-to-br ${course.gradient} flex h-40 flex-col justify-end p-12 text-white`}
      >
        <h3 className="mb-2 text-balance text-3xl font-bold">{course.title}</h3>
        {course.subtitle && (
          <p className="text-lg text-yellow-200">{course.subtitle}</p>
        )}
      </div>

      {/* Card Body */}
      <div className="bg-white p-6">
        {/* Title and Price */}
        <div className="mb-4">
          <h4 className="mb-2 text-lg font-semibold text-gray-900">
            {course.title}
          </h4>
          <div className="flex flex-col  gap-2">
            {course.isDone ? (
              <span className="text-sm font-semibold text-green-500">
                Hoàn thành
              </span>
            ) : (
              <span className="text-sm font-semibold text-red-500">
                Đang học
              </span>
            )}
            {course.createdAt && (
              <span className="text-sm text-gray-500">
                Ngày đăng ký: {__helpers.convertToDate(course.createdAt)}
              </span>
            )}
          </div>
        </div>

        {/* Enroll Button */}
        <button
          className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
          onClick={() => router.push(`/course/${course.id}`)}
        >
          Xem Chi Tiết
        </button>
      </div>
    </div>
  );
}
