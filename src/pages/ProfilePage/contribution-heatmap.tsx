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
  weekStartsOn?: 0 | 1;
  weeks?: number;
};

export default function ContributionHeatmap({
  loginHistories = [],
  weekStartsOn = 1, // Bắt đầu từ thứ 2
  weeks = 53
}: Props) {
  // --- Helpers ---
  const tz = 'Asia/Ho_Chi_Minh';

  const toLocalYmd = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const startOfWeek = (date: Date, startsOn: 0 | 1) => {
    const d = new Date(date);
    const day = d.getDay();
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

  // --- Build date range ---
  const today = React.useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const endWeekStart = React.useMemo(
    () => startOfWeek(today, weekStartsOn),
    [today, weekStartsOn]
  );

  const rangeStart = React.useMemo(
    () => addDays(endWeekStart, -(weeks - 1) * 7),
    [endWeekStart, weeks]
  );

  // --- Count logins per date ---
  const countsByDate = React.useMemo(() => {
    const map = new Map<string, number>();

    for (const item of loginHistories) {
      if (!item?.loginDate) continue;
      const d = new Date(item.loginDate);
      if (Number.isNaN(d.getTime())) continue;
      if (d < rangeStart || d > addDays(endWeekStart, 6)) continue;
      const key = toLocalYmd(d);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [loginHistories, rangeStart, endWeekStart]);

  // --- Statistics ---
  const stats = React.useMemo(() => {
    let totalLogins = 0;
    let activeDays = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Calculate totals
    for (const count of countsByDate.values()) {
      totalLogins += count;
      activeDays++;
    }

    // Calculate streaks (going backwards from today)
    let checkDate = new Date(today);
    let foundGap = false;

    for (let i = 0; i < weeks * 7; i++) {
      const ymd = toLocalYmd(checkDate);
      const count = countsByDate.get(ymd) ?? 0;

      if (count > 0) {
        tempStreak++;
        if (!foundGap) currentStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        foundGap = true;
        tempStreak = 0;
      }

      checkDate = addDays(checkDate, -1);
    }

    return { totalLogins, activeDays, currentStreak, longestStreak };
  }, [countsByDate, today, weeks]);

  // --- Determine intensity levels (0..4) with orange theme ---
  const maxCount = React.useMemo(() => {
    let max = 0;
    for (const v of countsByDate.values()) max = Math.max(max, v);
    return max;
  }, [countsByDate]);

  const getLevel = (count: number | undefined) => {
    if (!count || count <= 0) return 0;
    if (maxCount <= 4) return Math.min(count, 4);
    const ratio = count / maxCount;
    return Math.max(1, Math.ceil(ratio * 4));
  };

  // Orange theme colors
  const levelClass = (level: number) => {
    switch (level) {
      case 0:
        return 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700';
      case 1:
        return 'bg-orange-100 dark:bg-orange-950 border border-orange-200 dark:border-orange-900';
      case 2:
        return 'bg-orange-300 dark:bg-orange-800 border border-orange-400 dark:border-orange-700';
      case 3:
        return 'bg-orange-500 dark:bg-orange-600 border border-orange-600 dark:border-orange-500';
      case 4:
        return 'bg-orange-600 dark:bg-orange-500 border border-orange-700 dark:border-orange-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700';
    }
  };

  // Build grid data
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

  // Month labels
  const monthLabels = React.useMemo(() => {
    const labels: { weekIndex: number; label: string }[] = [];
    let prevMonth = -1;
    for (let w = 0; w < weeksData.length; w++) {
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
    count: number;
  } | null>(null);

  const handleEnter = (e: React.MouseEvent, cell: Cell) => {
    const dateStr = cell.date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: tz
    });
    const text = dateStr;
    setTip({ x: e.clientX, y: e.clientY, text, count: cell.count });
  };

  const handleLeave = () => setTip(null);

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8">
      {/* Header with Stats */}
      <div className="mb-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Hoạt động đăng nhập
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Theo dõi thói quen học tập của bạn
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Streak hiện tại
              </p>
            </div>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-500">
              {stats.currentStreak}
              <span className="ml-1 text-sm font-normal text-gray-500">
                ngày
              </span>
            </p>
          </div>

          <div className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xl">⭐</span>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Streak dài nhất
              </p>
            </div>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-500">
              {stats.longestStreak}
              <span className="ml-1 text-sm font-normal text-gray-500">
                ngày
              </span>
            </p>
          </div>

          <div className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xl">📅</span>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Ngày hoạt động
              </p>
            </div>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-500">
              {stats.activeDays}
              <span className="ml-1 text-sm font-normal text-gray-500">
                ngày
              </span>
            </p>
          </div>

          <div className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xl">✅</span>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Tổng đăng nhập
              </p>
            </div>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-500">
              {stats.totalLogins}
              <span className="ml-1 text-sm font-normal text-gray-500">
                lần
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {/* Legend */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            53 tuần gần nhất
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Ít</span>
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800" />
              <div className="h-3 w-3 rounded border border-orange-200 bg-orange-100 dark:border-orange-900 dark:bg-orange-950" />
              <div className="h-3 w-3 rounded border border-orange-400 bg-orange-300 dark:border-orange-700 dark:bg-orange-800" />
              <div className="h-3 w-3 rounded border border-orange-600 bg-orange-500 dark:border-orange-500 dark:bg-orange-600" />
              <div className="h-3 w-3 rounded border border-orange-700 bg-orange-600 dark:border-orange-400 dark:bg-orange-500" />
            </div>
            <span>Nhiều</span>
          </div>
        </div>

        {/* Grid Container */}
        <div className="relative overflow-x-auto">
          {/* Month labels */}
          <div className="mb-2 flex pl-10 text-xs font-medium text-gray-500 dark:text-gray-400">
            {monthLabels.map(({ weekIndex, label }, i) => (
              <div
                key={`${label}-${i}`}
                style={{
                  marginLeft:
                    weekIndex === 0
                      ? 0
                      : `${(weekIndex - (monthLabels[i - 1]?.weekIndex ?? 0)) * 14}px`
                }}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            {/* Weekday labels */}
            <div className="flex w-8 shrink-0 flex-col justify-around text-[10px] font-medium text-gray-500 dark:text-gray-400">
              <span>T2</span>
              <span>T4</span>
              <span>T6</span>
            </div>

            {/* Cells */}
            <div
              className="flex gap-1"
              role="grid"
              aria-label="Lịch sử đăng nhập"
            >
              {weeksData.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((cell, di) => {
                    const cls = `${levelClass(cell.isFuture ? 0 : cell.level)} h-3.5 w-3.5 rounded-sm transition-all duration-200 hover:scale-125 hover:shadow-md cursor-pointer`;
                    return (
                      <div
                        key={`${wi}-${di}`}
                        role="gridcell"
                        className={cls}
                        onMouseEnter={(e) => handleEnter(e, cell)}
                        onMouseLeave={handleLeave}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {tip && (
          <div
            className="pointer-events-none fixed z-50 rounded-lg border border-orange-200 bg-white px-3 py-2 shadow-xl dark:border-orange-800 dark:bg-gray-900"
            style={{ left: tip.x + 16, top: tip.y + 16 }}
          >
            <div className="flex items-center gap-2">
              {tip.count > 0 ? (
                <div className="flex h-6 w-6 items-center justify-center rounded bg-orange-100 dark:bg-orange-900">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                    {tip.count}
                  </span>
                </div>
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 dark:bg-gray-800">
                  <span className="text-xs text-gray-400">0</span>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white">
                  {tip.count > 0
                    ? `${tip.count} lần đăng nhập`
                    : 'Không có hoạt động'}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  {tip.text}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
