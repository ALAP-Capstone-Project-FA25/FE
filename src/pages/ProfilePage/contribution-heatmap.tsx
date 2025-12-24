'use client';

import * as React from 'react';

type LoginHistory = {
  userId: number;
  loginDate: string; // ISO string
  ipAddress?: string;
  userAgent?: string;
  id?: number;
  createdAt?: string;
  updatedAt?: string;
};

type Props = {
  loginHistories?: LoginHistory[];
  // Tuỳ chọn: bắt đầu tuần là Chủ nhật (0) hoặc Thứ hai (1)
  weekStartsOn?: 0 | 1;
  // Tuỳ chọn: số tuần hiển thị (mặc định 53 như GitHub)
  weeks?: number;
};

export default function ContributionHeatmap({
  loginHistories = [],
  weekStartsOn = 0,
  weeks = 53
}: Props) {
  console.log(loginHistories);
  // --- Helpers ---
  const tz = 'Asia/Ho_Chi_Minh';

  const toLocalYmd = (d: Date) => {
    // lấy yyyy-mm-dd theo local để gom nhóm chính xác theo ngày VN
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const startOfWeek = (date: Date, startsOn: 0 | 1) => {
    const d = new Date(date);
    const day = d.getDay(); // 0=Sun..6=Sat
    const diff = (day - startsOn + 7) % 7;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const addDays = (date: Date, n: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
  };

  // --- Build date range (53 weeks, aligned to week start) ---
  const today = React.useMemo(() => {
    const now = new Date();
    // Chốt ở 00:00 local cho hôm nay
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const endWeekStart = React.useMemo(
    () => startOfWeek(today, weekStartsOn),
    [today, weekStartsOn]
  );
  // Bắt đầu từ (weeks - 1) tuần trước
  const rangeStart = React.useMemo(
    () => addDays(endWeekStart, -(weeks - 1) * 7),
    [endWeekStart, weeks]
  );

  // --- Count logins per local date ---
  const countsByDate = React.useMemo(() => {
    const map = new Map<string, number>();

    for (const item of loginHistories) {
      if (!item?.loginDate) continue;
      // Parse ISO; JS tự convert sang local time.
      const d = new Date(item.loginDate);
      if (Number.isNaN(d.getTime())) continue;
      // Chỉ tính những ngày nằm trong khoảng hiển thị (tối ưu)
      if (d < rangeStart || d > addDays(endWeekStart, 6)) {
        // vẫn tính nếu muốn vượt, nhưng để gọn thì bỏ qua ngoài range
        continue;
      }
      const key = toLocalYmd(d);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [loginHistories, rangeStart, endWeekStart]);

  // --- Determine intensity levels (0..4) ---
  const maxCount = React.useMemo(() => {
    let max = 0;
    for (const v of countsByDate.values()) max = Math.max(max, v);
    return max;
  }, [countsByDate]);

  const getLevel = (count: number | undefined) => {
    if (!count || count <= 0) return 0;
    if (maxCount <= 4) {
      // ít dữ liệu -> trực tiếp theo count
      return Math.min(count, 4);
    }
    // Chuẩn hoá theo max
    const ratio = count / maxCount; // (0,1]
    // Map thành 1..4 (>=1)
    return Math.max(1, Math.ceil(ratio * 4));
  };

  // Tailwind color classes cho từng level (0..4)
  // Bạn có thể đổi bảng màu theo palette brand của bạn.
  const levelClass = (level: number) => {
    switch (level) {
      case 0:
        return 'bg-gray-100 dark:bg-gray-800';
      case 1:
        return 'bg-emerald-200 dark:bg-emerald-900';
      case 2:
        return 'bg-emerald-300 dark:bg-emerald-800';
      case 3:
        return 'bg-emerald-500 dark:bg-emerald-700';
      case 4:
        return 'bg-emerald-700 dark:bg-emerald-600';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  // Xây lưới: mảng các tuần, mỗi tuần là 7 ngày
  type Cell = {
    date: Date;
    ymd: string;
    count: number;
    level: number;
    isFuture: boolean;
  };

  const weeksData: Cell[][] = React.useMemo(() => {
    const out: Cell[][] = [];
    let cursor = new Date(rangeStart);

    for (let w = 0; w < weeks; w++) {
      const column: Cell[] = [];
      for (let d = 0; d < 7; d++) {
        const ymd = toLocalYmd(cursor);
        const count = countsByDate.get(ymd) ?? 0;
        const level = getLevel(count);
        const isFuture = cursor > today;
        column.push({ date: new Date(cursor), ymd, count, level, isFuture });
        cursor = addDays(cursor, 1);
      }
      out.push(column);
    }
    return out;
  }, [weeks, countsByDate, today, rangeStart]);

  // Nhãn tháng (chỉ hiện khi đổi tháng)
  const monthLabels = React.useMemo(() => {
    const labels: { weekIndex: number; label: string }[] = [];
    let prevMonth = -1;
    for (let w = 0; w < weeksData.length; w++) {
      // dùng ngày đầu của cột tuần
      const firstDay = weeksData[w][0].date;
      const m = firstDay.getMonth();
      if (m !== prevMonth) {
        labels.push({
          weekIndex: w,
          label: firstDay.toLocaleString('vi-VN', { month: 'short' })
        });
        prevMonth = m;
      }
    }
    return labels;
  }, [weeksData]);

  // Tooltip state
  const [tip, setTip] = React.useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);

  const handleEnter = (e: React.MouseEvent, cell: Cell) => {
    const dateStr = cell.date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: tz
    });
    const text =
      cell.count > 0
        ? `${cell.count} lần đăng nhập • ${dateStr}`
        : `Không có đăng nhập • ${dateStr}`;
    setTip({ x: e.clientX, y: e.clientY, text });
  };

  const handleLeave = () => setTip(null);

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Lịch sử đăng nhập (53 tuần gần nhất)
        </div>
        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          Ít
          <div className="flex gap-1">
            <span className="h-3 w-3 rounded-sm border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800" />
            <span className="h-3 w-3 rounded-sm bg-emerald-200 dark:bg-emerald-900" />
            <span className="h-3 w-3 rounded-sm bg-emerald-300 dark:bg-emerald-800" />
            <span className="h-3 w-3 rounded-sm bg-emerald-500 dark:bg-emerald-700" />
            <span className="h-3 w-3 rounded-sm bg-emerald-700 dark:bg-emerald-600" />
          </div>
          Nhiều
        </div>
      </div>

      {/* Grid */}
      <div className="relative">
        {/* Month labels */}
        <div className="mb-1 ml-8 flex text-[10px] text-gray-500 dark:text-gray-400">
          {/* spacer for weekday labels on the left */}
          <div className="w-8 shrink-0" />
          <div className="flex">
            {monthLabels.map(({ weekIndex, label }, i) => (
              <div
                key={`${label}-${i}`}
                className="text-[10px]"
                style={{
                  marginLeft:
                    weekIndex === 0
                      ? 0
                      : (weekIndex - (monthLabels[i - 1]?.weekIndex ?? 0)) * 12
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="flex">
          {/* Weekday labels */}
          <div className="mr-2 flex w-8 shrink-0 flex-col justify-between py-[2px] text-[10px] leading-3 text-gray-500 dark:text-gray-400">
            {/* hiện 3 mốc như GitHub */}
            <span className="translate-y-[2px]">
              {weekStartsOn === 1 ? 'T2' : 'CN'}
            </span>
            <span>T4</span>
            <span className="-translate-y-[2px]">T6</span>
          </div>

          {/* Cells */}
          <div
            className="flex gap-[2px]"
            role="grid"
            aria-label="Login contribution heatmap"
          >
            {weeksData.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2px]">
                {week.map((cell, di) => {
                  const cls = `${levelClass(cell.isFuture ? 0 : cell.level)} h-3 w-3 rounded-[3px]`;
                  return (
                    <div
                      key={`${wi}-${di}`}
                      role="gridcell"
                      aria-label={`${cell.count} logins on ${cell.date.toDateString()}`}
                      className={cls}
                      onMouseEnter={(e) => handleEnter(e, cell)}
                      onMouseLeave={handleLeave}
                      title={
                        cell.count > 0
                          ? `${cell.count} lần đăng nhập`
                          : 'Không có đăng nhập'
                      }
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip */}
        {tip && (
          <div
            className="pointer-events-none fixed z-50 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 shadow-md dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            style={{ left: tip.x + 12, top: tip.y + 12 }}
          >
            {tip.text}
          </div>
        )}
      </div>
    </div>
  );
}
