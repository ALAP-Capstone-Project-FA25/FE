import __helpers from '@/helpers/index';
import BaseRequest from '@/config/axios.config';
import { useQuery } from '@tanstack/react-query';

export interface AdaptiveCourseRecommendationDto {
  courseId: number;
  courseTitle: string;
  courseDescription: string;
  imageUrl: string;
  recommendationScore: number;
  recommendationReason: string;
  weakLessonCount: number;
  averageMasteryLevel: number;
  isEnrolled: boolean;
  weakAreas: WeakAreaSummaryDto[];
}

export interface WeakAreaSummaryDto {
  lessonId: number;
  lessonTitle: string;
  referralCount: number;
  masteryLevel: number;
}

export interface AdaptiveLessonRecommendationDto {
  lessonId: number;
  lessonTitle: string;
  lessonDescription: string;
  lessonVideoUrl: string;
  lessonType: number; // 1 = VIDEO, 2 = DOCUMENT
  topicId: number;
  topicTitle: string;
  courseId: number;
  courseTitle: string;
  courseImageUrl: string;
  recommendationScore: number;
  recommendationReason: string;
  referralCount: number;
  masteryLevel: number;
  isEnrolled: boolean;
  wrongQuestions: WrongQuestionDetailDto[];
}

export interface WrongQuestionDetailDto {
  questionId: number;
  questionText: string;
  courseTitle: string;
  topicTitle: string;
  selectedAnswers: string;
  correctAnswers: string;
}

export const useGetAdaptiveCourseRecommendations = (
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['adaptive-course-recommendations'],
    queryFn: async () => {
      return BaseRequest.Get<AdaptiveCourseRecommendationDto[]>(
        `/api/AdaptiveRecommendation/courses`
      );
    },
    enabled
  });
};

export const useGetAdaptiveLessonRecommendations = (
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['adaptive-lesson-recommendations'],
    queryFn: async () => {
      return BaseRequest.Get<AdaptiveLessonRecommendationDto[]>(
        `/api/AdaptiveRecommendation/lessons`
      );
    },
    enabled: enabled && !!__helpers.cookie_get('AT')
  });
};

export interface UserLearningStatisticsDto {
  totalQuizAttempts: number;
  averageScore: number;
  totalCorrectAnswers: number;
  totalWrongAnswers: number;
  totalQuestionsAnswered: number;
  totalTimeSpent: number;
  scoreDistribution: ScoreDistributionDto[];
  attemptsByDate: QuizAttemptByDateDto[];
  coursePerformance: CoursePerformanceDto[];
  topicPerformance: TopicPerformanceDto[];
}

export interface ScoreDistributionDto {
  range: string;
  count: number;
}

export interface QuizAttemptByDateDto {
  date: string;
  attemptCount: number;
  averageScore: number;
}

export interface CoursePerformanceDto {
  courseId: number;
  courseTitle: string;
  attemptCount: number;
  averageScore: number;
  totalQuestions: number;
  correctAnswers: number;
}

export interface TopicPerformanceDto {
  topicId: number;
  topicTitle: string;
  courseId: number;
  courseTitle: string;
  attemptCount: number;
  averageScore: number;
  bestScore: number;
}

export const useGetUserLearningStatistics = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['user-learning-statistics'],
    queryFn: async () => {
      return BaseRequest.Get<UserLearningStatisticsDto>(
        `/api/AdaptiveRecommendation/statistics`
      );
    },
    enabled
  });
};
