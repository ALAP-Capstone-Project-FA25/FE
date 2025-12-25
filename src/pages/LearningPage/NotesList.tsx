import { Note } from './types';
import { formatTime } from './utils';

export default function NotesList({
  notes,
  onJump,
  onDelete,
  onAsk
}: {
  notes: Note[];
  onJump: (time: number) => void;
  onDelete: (id: string) => void;
  onAsk: (note: Note) => void;
}) {
  const sorted = notes.slice().sort((a, b) => a.time - b.time);
  return (
    <div className="space-y-2">
      {sorted.map((n) => (
        <div
          key={n.id}
          className="flex items-center justify-between rounded-md border border-gray-800/50 bg-gray-800/40 px-3 py-2"
        >
          <button
            className="rounded bg-gray-700 px-2 py-1 text-xs font-semibold text-white hover:bg-gray-600"
            onClick={() => onJump(n.time)}
            title="Nhảy tới mốc thời gian"
          >
            {formatTime(n.time)}
          </button>
          <p className="mx-3 flex-1 truncate text-sm text-gray-200">{n.text}</p>
          <div className="flex gap-2">
            <button
              className="rounded-[10px] bg-orange-500 p-2 text-xs text-white hover:text-white"
              onClick={() => onAsk(n)}
            >
              Hỏi đáp
            </button>
            <button
              className="text-xs text-gray-400 hover:text-red-400"
              onClick={() => onDelete(n.id)}
            >
              Xóa
            </button>
          </div>
        </div>
      ))}
      {sorted.length === 0 && (
        <p className="text-sm text-gray-500">
          Chưa có ghi chú — bấm “Thêm ghi chú” để lưu mốc thời gian quan trọng.
        </p>
      )}
    </div>
  );
}
