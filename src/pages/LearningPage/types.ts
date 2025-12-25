export interface TopicQuestionAnswer {
  topicQuestionId: number;
  answer: string;
  isCorrect: boolean;
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface TopicQuestion {
  topicId: number;
  question: string;
  maxChoices: number;
  topicQuestionAnswers: TopicQuestionAnswer[];
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  content: string;
  isCurrent: boolean;
  videoUrl: string;
  duration: number; // phút
  orderIndex: number;
  isFree: boolean;
  topicId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  id: number;
  title: string;
  description: string;
  orderIndex: number;
  isCurrent: boolean;
  courseId: number;
  lessons: Lesson[];
  topicQuestions: TopicQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizItem {
  type: 'quiz';
  topicId: number;
  topicTitle: string;
  questionCount: number;
}

export interface Note {
  id: string;
  time: number; // giây
  text: string;
  createdAt: string; // ISO
}
