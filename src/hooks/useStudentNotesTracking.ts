import { useEffect, useRef, useState } from 'react';
import { HubConnection, HubConnectionState } from '@microsoft/signalr';
import { createChatConnection } from '@/lib/signalr';
import { Note } from '@/pages/LearningPage/types';

interface StudentNote extends Note {
  lessonId?: number;
  lessonTitle?: string;
  lessonType?: 'video' | 'document';
  page?: number;
}

export function useStudentNotesTracking(studentId: number, lessonId: number) {
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    if (!studentId || !lessonId) return;

    const connection = createChatConnection();
    connectionRef.current = connection;

    const start = async () => {
      try {
        await connection.start();
        console.log('SignalR connected for notes tracking');
        setIsConnected(true);

        // Join room for this specific student-lesson combination
        const roomName = `student-notes-${studentId}-${lessonId}`;
        await connection.invoke('JoinRoom', roomName);
        console.log('Joined notes tracking room:', roomName);

        // Listen for note creation
        connection.on('StudentNoteCreated', (note: StudentNote) => {
          console.log('Received note created:', note);
          if (note.lessonId === lessonId) {
            setNotes((prev) => {
              // Check if note already exists to avoid duplicates
              const exists = prev.some((n) => n.id === note.id);
              if (exists) return prev;

              // Add new note and sort by creation time (newest first)
              return [...prev, note].sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              );
            });
          }
        });

        // Listen for note updates
        connection.on('StudentNoteUpdated', (note: StudentNote) => {
          console.log('Received note updated:', note);
          if (note.lessonId === lessonId) {
            setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
          }
        });

        // Listen for note deletion
        connection.on('StudentNoteDeleted', (noteId: string) => {
          console.log('Received note deleted:', noteId);
          setNotes((prev) => prev.filter((n) => n.id !== noteId));
        });
      } catch (err) {
        console.error('SignalR notes tracking error:', err);
        setIsConnected(false);
      }
    };

    start();

    return () => {
      const stop = async () => {
        try {
          if (connection.state === HubConnectionState.Connected) {
            const roomName = `student-notes-${studentId}-${lessonId}`;
            await connection.invoke('LeaveRoom', roomName);
          }
          await connection.stop();
        } catch (err) {
          console.error('Error stopping notes tracking SignalR:', err);
        }
      };
      stop();
      setIsConnected(false);
    };
  }, [studentId, lessonId]);

  const updateNotes = (newNotes: StudentNote[]) => {
    setNotes(
      newNotes.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    );
  };

  return {
    notes,
    isConnected,
    updateNotes,
    connection: connectionRef.current
  };
}
