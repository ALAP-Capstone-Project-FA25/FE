import BaseRequest from '@/config/axios.config';
import { useMutation, useQuery } from '@tanstack/react-query';

export interface SubmitTopicQuizDto {
  topicId: number;
  userTopicId: number;
  answers: Record<number, number[]>; // QuestionId -> List of AnswerIds
  timeSpent?: number; // Seconds
}

export interface QuizResultDto {
  attemptId: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  attemptNumber: number;
  suggestedLessons: SuggestedLessonDto[];
}

export interface SuggestedLessonDto {
  lessonId: number;
  lessonTitle: string;
  lessonDescription: string;
  topicId: number;
  topicTitle: string;
  courseId: number;
  courseTitle: string;
  wrongQuestionCount: number;
}

export const useSubmitTopicQuiz = () => {
  return useMutation({
    mutationKey: ['submit-topic-quiz'],
    mutationFn: async (data: SubmitTopicQuizDto) => {
      return BaseRequest.Post<QuizResultDto>(`/api/TopicQuiz/submit`, data);
    }
  });
};

export const useGetSuggestedLessons = (topicId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['suggested-lessons', topicId],
    queryFn: async () => {
      return BaseRequest.Get<SuggestedLessonDto[]>(`/api/TopicQuiz/suggested-lessons/${topicId}`);
    },
    enabled: enabled && topicId > 0
  });
};

