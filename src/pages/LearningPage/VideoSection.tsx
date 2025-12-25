import YouTube, { YouTubeProps } from 'react-youtube';
import { Play } from 'lucide-react';
import { Lesson, QuizItem, Topic } from './types';
import QuizPanel from './QuizPanel';

export default function VideoSection({
  currentLesson,
  currentQuiz,
  topicForQuiz,
  videoId,
  onPlayerReady,
  onStateChange,
  isPlaying,
  setIsPlaying,
  // quiz props
  quizStarted,
  setQuizStarted,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  selectedAnswers,
  handleAnswerSelect,
  showResults,
  setShowResults,
  calculateScore,
  resetQuiz,
  exitQuiz
}: {
  currentLesson: Lesson | null;
  currentQuiz: QuizItem | null;
  topicForQuiz: Topic | null;
  videoId: string;
  onPlayerReady: YouTubeProps['onReady'];
  onStateChange: YouTubeProps['onStateChange'];
  isPlaying: boolean;
  setIsPlaying: (b: boolean) => void;
  // quiz props
  quizStarted: boolean;
  setQuizStarted: (b: boolean) => void;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (fn: (prev: number) => number) => void;
  selectedAnswers: Record<number, number[]>;
  handleAnswerSelect: (
    questionId: number,
    answerId: number,
    maxChoices: number
  ) => void;
  showResults: boolean;
  setShowResults: (b: boolean) => void;
  calculateScore: (topic: Topic) => {
    correct: number;
    total: number;
    percentage: number;
  };
  resetQuiz: () => void;
  exitQuiz: () => void;
}) {
  return (
    <div className="relative flex flex-1 items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
      {currentQuiz && topicForQuiz ? (
        <QuizPanel
          currentQuiz={currentQuiz}
          topic={topicForQuiz}
          userTopicId={topicForQuiz.userTopicId || 0}
          quizStarted={quizStarted}
          setQuizStarted={setQuizStarted}
          currentQuestionIndex={currentQuestionIndex}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          selectedAnswers={selectedAnswers}
          handleAnswerSelect={handleAnswerSelect}
          showResults={showResults}
          setShowResults={setShowResults}
          calculateScore={calculateScore}
          resetQuiz={resetQuiz}
          exitQuiz={exitQuiz}
        />
      ) : currentLesson && currentLesson.videoUrl ? (
        <div className="h-full w-full">
          <YouTube
            videoId={videoId}
            onReady={onPlayerReady}
            onStateChange={onStateChange}
            opts={{
              playerVars: {
                autoplay: 1,
                rel: 0,
                modestbranding: 1,
                enablejsapi: 1,
                origin:
                  typeof window !== 'undefined'
                    ? window.location.origin
                    : undefined
              }
            }}
            iframeClassName="h-full w-full"
            className="h-full w-full"
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-64 w-96 items-center justify-center rounded-3xl bg-gray-700/50 backdrop-blur-sm">
            <button
              className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-500 shadow-2xl transition-colors hover:bg-orange-600"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              <Play className="ml-1 h-8 w-8 fill-current text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
