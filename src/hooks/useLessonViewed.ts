import { useState, useEffect } from 'react';

const VIEWED_LESSONS_KEY = 'viewed_lesson_recommendations';

export function useLessonViewed(lessonIds: number[]) {
  const [viewedLessons, setViewedLessons] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Load viewed lessons from localStorage
    const stored = localStorage.getItem(VIEWED_LESSONS_KEY);
    if (stored) {
      try {
        const viewed = JSON.parse(stored) as number[];
        setViewedLessons(new Set(viewed));
      } catch (e) {
        console.error('Error loading viewed lessons:', e);
      }
    }
  }, []);

  const markAsViewed = (lessonId: number) => {
    setViewedLessons((prev) => {
      const newSet = new Set(prev);
      newSet.add(lessonId);
      // Save to localStorage
      localStorage.setItem(
        VIEWED_LESSONS_KEY,
        JSON.stringify(Array.from(newSet))
      );
      return newSet;
    });
  };

  const getUnviewedLessons = (allLessons: number[]) => {
    return allLessons.filter((id) => !viewedLessons.has(id));
  };

  const hasUnviewedLessons = (allLessons: number[]) => {
    return allLessons.some((id) => !viewedLessons.has(id));
  };

  return {
    viewedLessons,
    markAsViewed,
    getUnviewedLessons,
    hasUnviewedLessons
  };
}
