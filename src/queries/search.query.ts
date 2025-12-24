import BaseRequest from '@/config/axios.config';
import { useQuery } from '@tanstack/react-query';

export interface CourseSearchResult {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  categoryName: string;
}

export interface LessonSearchResult {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  courseTitle: string;
  topicTitle: string;
  courseId: number;
  topicId: number;
}

export interface TopicSearchResult {
  id: number;
  title: string;
  description: string;
  courseTitle: string;
  courseId: number;
}

export interface SearchResult {
  courses: CourseSearchResult[];
  lessons: LessonSearchResult[];
  topics: TopicSearchResult[];
  totalCount: number;
}

export const useSearchAll = (keyword: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['search', keyword],
    queryFn: async () => {
      if (!keyword || keyword.trim().length === 0) {
        return {
          courses: [],
          lessons: [],
          topics: [],
          totalCount: 0
        } as SearchResult;
      }

      const params = new URLSearchParams();
      params.append('keyword', keyword.trim());
      params.append('limit', '10');

      return BaseRequest.Get<SearchResult>(
        `/api/Search/all?${params.toString()}`
      );
    },
    enabled: enabled && keyword.trim().length > 0,
    staleTime: 30000 // Cache for 30 seconds
  });
};
