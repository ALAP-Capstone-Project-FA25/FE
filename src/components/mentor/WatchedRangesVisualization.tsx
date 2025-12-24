import { cn } from '@/lib/utils';

interface WatchedRange {
  start: number;
  end: number;
}

interface WatchedRangesVisualizationProps {
  watchedRanges: WatchedRange[];
  totalDuration: number;
  currentTime?: number;
  className?: string;
}

export default function WatchedRangesVisualization({
  watchedRanges,
  totalDuration,
  currentTime = 0,
  className
}: WatchedRangesVisualizationProps) {
  if (totalDuration <= 0) {
    return (
      <div className={cn('h-2 rounded-full bg-gray-300', className)}>
        <div className="h-full w-0 rounded-full bg-gray-400" />
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPercentage = (time: number) => {
    return Math.min(100, Math.max(0, (time / totalDuration) * 100));
  };

  const totalWatchedTime = watchedRanges.reduce(
    (total, range) => total + Math.max(0, range.end - range.start),
    0
  );

  const watchedPercentage = Math.min(
    100,
    (totalWatchedTime / totalDuration) * 100
  );

  return (
    <div className={cn('space-y-2', className)}>
      {/* Progress bar with watched ranges */}
      <div className="relative h-3 overflow-hidden rounded-full bg-gray-200">
        {/* Watched ranges */}
        {watchedRanges.map((range, index) => {
          const startPercent = getPercentage(range.start);
          const widthPercent = getPercentage(range.end) - startPercent;

          return (
            <div
              key={index}
              className="absolute h-full bg-blue-500 transition-all duration-300"
              style={{
                left: `${startPercent}%`,
                width: `${widthPercent}%`
              }}
              title={`Đã xem: ${formatTime(range.start)} - ${formatTime(range.end)}`}
            />
          );
        })}

        {/* Current position indicator */}
        {currentTime > 0 && (
          <div
            className="absolute top-0 z-10 h-full w-0.5 bg-red-500"
            style={{ left: `${getPercentage(currentTime)}%` }}
            title={`Vị trí hiện tại: ${formatTime(currentTime)}`}
          />
        )}

        {/* Time markers */}
        <div className="absolute inset-0 flex items-center justify-between px-1">
          {Array.from({ length: 5 }, (_, i) => {
            const time = (totalDuration / 4) * i;
            return (
              <div
                key={i}
                className="h-2 w-px bg-gray-400 opacity-50"
                title={formatTime(time)}
              />
            );
          })}
        </div>
      </div>

      {/* Statistics */}
      <div className="flex justify-between text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <span>
            Đã xem: {formatTime(totalWatchedTime)} / {formatTime(totalDuration)}
          </span>
          <span className="font-medium text-blue-600">
            {watchedPercentage.toFixed(1)}%
          </span>
        </div>

        {currentTime > 0 && <span>Vị trí: {formatTime(currentTime)}</span>}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="h-2 w-3 rounded-sm bg-blue-500" />
          <span>Đã xem</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-3 rounded-sm bg-gray-200" />
          <span>Chưa xem</span>
        </div>
        {currentTime > 0 && (
          <div className="flex items-center gap-1">
            <div className="h-3 w-0.5 bg-red-500" />
            <span>Vị trí hiện tại</span>
          </div>
        )}
      </div>
    </div>
  );
}
