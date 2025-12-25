import { useRef, useMemo, useCallback, useEffect } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { Play, Pause, Eye } from 'lucide-react';
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
  const { videoProgress: realtimeProgress } = useStudentVideoTracking(
    studentId,
    currentLesson?.id || 0
  );

  // Use real-time progress if available, otherwise fall back to initial data
  const videoProgress = realtimeProgress || initialVideoProgress;

  // Memoize player options to avoid re-renders
  const playerOpts = useMemo(
    () => ({
      width: '100%',
      height: '100%',
      playerVars: {
        autoplay: 0,
        controls: 1,
        disablekb: 0,
        fs: 1,
        modestbranding: 1,
        rel: 0,
        showinfo: 0
      }
    }),
    []
  );

  const handlePlayerReady: YouTubeProps['onReady'] = useCallback(
    (event) => {
      playerRef.current = event.target;

      // Call parent callback with player reference
      if (onPlayerReady) {
        onPlayerReady(event.target);
      }

      // Seek to student's current position if available
      if (videoProgress?.CurrentTime) {
        event.target.seekTo(videoProgress.CurrentTime, true);
      }
    },
    [onPlayerReady, videoProgress?.CurrentTime]
  );

  const onStateChange: YouTubeProps['onStateChange'] = useCallback(() => {
    // Read-only mode - no state changes needed
  }, []);

  // Update player position when videoProgress changes (for real-time updates)
  useEffect(() => {
    if (playerRef.current && videoProgress?.CurrentTime) {
      // Only seek if the difference is significant (more than 2 seconds)
      const currentTime = playerRef.current.getCurrentTime();
      if (Math.abs(currentTime - videoProgress.CurrentTime) > 2) {
        playerRef.current.seekTo(videoProgress.CurrentTime, true);
      }
    }
  }, [videoProgress?.CurrentTime]);

  // Memoize watched ranges to avoid re-renders
  const watchedRanges = useMemo(() => {
    if (!videoProgress?.WatchedRanges) return [];
    return videoProgress.WatchedRanges.map(([start, end]) => ({
      start,
      end
    }));
  }, [videoProgress?.WatchedRanges]);

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
        <div className="absolute left-4 top-4 z-10 flex gap-2"></div>

        {/* Student progress indicator */}
        {videoProgress && (
          <div className="absolute right-4 top-4 z-10">
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
                    {String(
                      Math.floor(videoProgress.CurrentTime % 60)
                    ).padStart(2, '0')}
                  </span>
                </div>
                <span>/</span>
                <span>
                  {Math.floor(videoProgress.TotalDuration / 60)}:
                  {String(
                    Math.floor(videoProgress.TotalDuration % 60)
                  ).padStart(2, '0')}
                </span>
              </div>
              <div className="mt-1 h-1 w-32 overflow-hidden rounded-full bg-gray-600">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{
                    width: `${
                      videoProgress.TotalDuration > 0
                        ? (videoProgress.WatchedDuration /
                            videoProgress.TotalDuration) *
                          100
                        : 0
                    }%`
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <YouTube
          key={videoId} // Force re-mount when videoId changes
          videoId={videoId}
          onReady={handlePlayerReady}
          onStateChange={onStateChange}
          opts={playerOpts}
          className="h-full w-full"
        />

        {/* Watched ranges visualization */}
        {videoProgress && watchedRanges.length > 0 && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="rounded-lg bg-black/80 p-3">
              <WatchedRangesVisualization
                watchedRanges={watchedRanges}
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
