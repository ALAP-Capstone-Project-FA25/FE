import { useEffect, useRef, useState } from 'react';
import { HubConnection, HubConnectionState } from '@microsoft/signalr';
import { createChatConnection } from '@/lib/signalr';

interface VideoProgress {
  studentId: number;
  lessonId: number;
  currentTime: number;
  isPlaying: boolean;
  totalDuration: number;
  watchedDuration: number;
  watchedRanges: [number, number][];
  lastUpdated: string;
}

export function useStudentVideoTracking(studentId: number, lessonId: number) {
  const [videoProgress, setVideoProgress] = useState<VideoProgress | null>(
    null
  );
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    if (!studentId || !lessonId) return;

    const connection = createChatConnection();
    connectionRef.current = connection;

    const start = async () => {
      try {
        await connection.start();
        console.log('SignalR connected for video tracking');
        setIsConnected(true);

        // Join room for this specific student-lesson combination
        const roomName = `student-video-${studentId}-${lessonId}`;
        await connection.invoke('JoinRoom', roomName);
        console.log('Joined video tracking room:', roomName);

        // Listen for video progress updates
        connection.on(
          'StudentVideoProgressUpdated',
          (progress: VideoProgress) => {
            console.log('Received video progress update:', progress);
            if (
              progress.studentId === studentId &&
              progress.lessonId === lessonId
            ) {
              setVideoProgress(progress);
            }
          }
        );

        // Listen for video position changes
        connection.on(
          'StudentVideoPositionChanged',
          (data: {
            studentId: number;
            lessonId: number;
            currentTime: number;
            isPlaying: boolean;
          }) => {
            console.log('Received video position change:', data);
            if (data.studentId === studentId && data.lessonId === lessonId) {
              setVideoProgress((prev) =>
                prev
                  ? {
                      ...prev,
                      currentTime: data.currentTime,
                      isPlaying: data.isPlaying,
                      lastUpdated: new Date().toISOString()
                    }
                  : null
              );
            }
          }
        );
      } catch (err) {
        console.error('SignalR video tracking error:', err);
        setIsConnected(false);
      }
    };

    start();

    return () => {
      const stop = async () => {
        try {
          if (connection.state === HubConnectionState.Connected) {
            const roomName = `student-video-${studentId}-${lessonId}`;
            await connection.invoke('LeaveRoom', roomName);
          }
          await connection.stop();
        } catch (err) {
          console.error('Error stopping video tracking SignalR:', err);
        }
      };
      stop();
      setIsConnected(false);
    };
  }, [studentId, lessonId]);

  // Convert camelCase to PascalCase to match component expectations
  const formattedProgress = videoProgress
    ? {
        studentId: videoProgress.studentId,
        lessonId: videoProgress.lessonId,
        CurrentTime: videoProgress.currentTime,
        IsPlaying: videoProgress.isPlaying,
        TotalDuration: videoProgress.totalDuration,
        WatchedDuration: videoProgress.watchedDuration,
        WatchedRanges: videoProgress.watchedRanges,
        LastUpdated: videoProgress.lastUpdated
      }
    : null;

  return {
    videoProgress: formattedProgress,
    isConnected,
    connection: connectionRef.current
  };
}
