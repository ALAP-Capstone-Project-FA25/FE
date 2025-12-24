'use client';

import { Star, Users, Eye, Clock } from 'lucide-react';

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

export default function CourseCard({ course }: { course: Course }) {
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
          {course.isFree && (
            <span className="text-sm font-semibold text-orange-500">
              Miễn phí
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {course.stats.learners}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{course.stats.rating}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{course.stats.views}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {course.stats.duration}
            </span>
          </div>
        </div>

        {/* Enroll Button */}
        <button className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700">
          Xem Chi Tiết
        </button>
      </div>
    </div>
  );
}
