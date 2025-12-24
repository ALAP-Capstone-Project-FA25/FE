import { useRef } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { Play, Pause, Eye, EyeOff, Wifi, WifiOff } from 'lucide-react';
import { Lesson, QuizItem, Topic } from '@/pages/LearningPage/types';
import { Badge } from '@/components/ui/badge';
import { useGetStudentVideoProgress } from '@/queries/mentor.query';
import { useStudentVideoTracking } from '@/hooks/useStudentVideoTracking';
import WatchedRangesVisualization from './WatchedRangesVisualization';

interface ReadOnlyVideoSectionProps {
  currentLesson: Lesson | null;
  currentQuiz: QuizItem | null;
  topicForQuiz: Topic | null;
  videoId: string;
  studentId: number;
  onPlayerReady?: (player: any) => void;
}

export default function ReadOnlyVideoSection({
  currentLesson,
  currentQuiz,
  topicForQuiz,
  videoId,
  studentId,
  onPlayerReady
}: ReadOnlyVideoSectionProps) {
  const playerRef = useRef<any>(null);

  // Get student's video progress (initial load)
  const { data: initialVideoProgress } = useGetStudentVideoProgress(
    studentId, 
    currentLesson?.id || 0
  );

  // Real-time video tracking
  const { videoProgress: realtimeProgress, isConnected } = useStudentVideoTracking(
    studentId,
    currentLesson?.id || 0
  );

  // Use real-time progress if available, otherwise fall back to initial data
  const videoProgress = realtimeProgress || initialVideoProgress;

  const handlePlayerReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    
    // Call parent callback with player reference
    if (onPlayerReady) {
      onPlayerReady(event.target);
    }
    
    // Seek to student's current position if available
    if (videoProgress?.CurrentTime) {
      event.target.seekTo(videoProgress.CurrentTime, true);
    }
  };

  const onStateChange: YouTubeProps['onStateChange'] = () => {
    // Read-only mode - no state changes needed
  };

  // Render quiz panel for read-only view
  if (currentQuiz && topicForQuiz) {
    return (
      <div className="relative flex h-full items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="mb-4 rounded-lg bg-blue-500/20 p-4">
            <h3 className="text-lg font-semibold text-white">
              Quiz: {currentQuiz.topicTitle}
            </h3>
            <p className="text-sm text-gray-300">
              {currentQuiz.questionCount} câu hỏi
            </p>
          </div>
          <Badge variant="secondary" className="bg-gray-700 text-gray-300">
            Chế độ xem mentor - Không thể tương tác với quiz
          </Badge>
        </div>
      </div>
    );
  }

  // Render video player for read-only view
  if (currentLesson && videoId) {
    return (
      <div className="relative h-full bg-black">
        {/* Read-only indicator with connection status */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <Badge variant="secondary" className="bg-black/70 text-white border-gray-600">
            <EyeOff className="mr-1 h-3 w-3" />
            Chế độ xem mentor
          </Badge>
          
          <Badge 
            variant="secondary" 
            className={`bg-black/70 border-gray-600 ${
              isConnected ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {isConnected ? (
              <>
                <Wifi className="mr-1 h-3 w-3" />
                Theo dõi trực tiếp
              </>
            ) : (
              <>
                <WifiOff className="mr-1 h-3 w-3" />
                Mất kết nối
              </>
            )}
          </Badge>
        </div>

        {/* Student progress indicator */}
        {videoProgress && (
          <div className="absolute top-4 right-4 z-10">
            <div className="rounded-lg bg-black/70 p-2 text-white">
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1">
                  {videoProgress.IsPlaying ? (
                    <Play className="h-3 w-3 text-green-400" />
                  ) : (
                    <Pause className="h-3 w-3 text-gray-400" />
                  )}
                  <span>
                    {Math.floor(videoProgress.CurrentTime / 60)}:
                    {String(Math.floor(videoProgress.CurrentTime % 60)).padStart(2, '0')}
                  </span>
                </div>
                <span>/</span>
                <span>
                  {Math.floor(videoProgress.TotalDuration / 60)}:
                  {String(Math.floor(videoProgress.TotalDuration % 60)).padStart(2, '0')}
                </span>
              </div>
              <div className="mt-1 h-1 w-32 bg-gray-600 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ 
                    width: `${videoProgress.TotalDuration > 0 
                      ? (videoProgress.WatchedDuration / videoProgress.TotalDuration) * 100 
                      : 0}%` 
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <YouTube
          videoId={videoId}
          onReady={handlePlayerReady}
          onStateChange={onStateChange}
          opts={{
            width: '100%',
            height: '100%',
            playerVars: {
              autoplay: 0,
              controls: 1, // Enable basic controls for mentor
              disablekb: 0, // Allow keyboard controls
              fs: 1, // Allow fullscreen
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
            },
          }}
          className="h-full w-full"
        />

        {/* Watched ranges visualization */}
        {videoProgress && videoProgress.WatchedRanges && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="rounded-lg bg-black/80 p-3">
              <WatchedRangesVisualization
                watchedRanges={videoProgress.WatchedRanges.map(([start, end]) => ({
                  start,
                  end
                }))}
                totalDuration={videoProgress.TotalDuration}
                currentTime={videoProgress.CurrentTime}
              />
            </div>
          </div>
        )}


      </div>
    );
  }

  // No content state
  return (
    <div className="flex h-full items-center justify-center bg-gray-900">
      <div className="text-center text-gray-400">
        <Eye className="mx-auto mb-2 h-12 w-12" />
        <p>Chưa có nội dung để hiển thị</p>
      </div>
    </div>
  );
}