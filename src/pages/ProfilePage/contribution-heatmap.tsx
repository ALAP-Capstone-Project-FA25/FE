'use client';
import * as React from 'react';

type LoginHistory = {
  userId: number;
  loginDate: string;
  ipAddress?: string;
  userAgent?: string;
  id?: number;
  createdAt?: string;
  updatedAt?: string;
};

type Props = {
  loginHistories?: LoginHistory[];
  weekStartsOn?: 0 | 1;
};

type CellData = {
  date: Date;
  count: number;
  level: number;
  isFuture: boolean;
  isToday: boolean;
};

type MonthGroup = {
  monthLabel: string;
  year: number;
  month: number;
  weeks: CellData[][];
};

export default function ContributionHeatmap({
  loginHistories = [],
  weekStartsOn = 1
}: Props) {
  // Helper functions
  const startOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const addDays = (date: Date, days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };

  const getDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getStartOfWeek = (date: Date, startsOn: 0 | 1) => {
    const d = startOfDay(date);
    const day = d.getDay();
    const diff = (day - startsOn + 7) % 7;
    d.setDate(d.getDate() - diff);
    return d;
  };

  const getStartOfMonth = (date: Date) => {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // Calculate date range - exactly 12 months from current month back to 11 months ago
  const today = React.useMemo(() => startOfDay(new Date()), []);

  const startDate = React.useMemo(() => {
    const currentMonth = getStartOfMonth(today);
    const elevenMonthsAgo = new Date(currentMonth);
    elevenMonthsAgo.setMonth(elevenMonthsAgo.getMonth() - 11);
    return getStartOfWeek(elevenMonthsAgo, weekStartsOn);
  }, [today, weekStartsOn]);

  const endDate = React.useMemo(() => {
    const nextMonth = getStartOfMonth(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const lastDayOfCurrentMonth = addDays(nextMonth, -1);
    return lastDayOfCurrentMonth;
  }, [today]);

  // Count logins per date
  const loginCounts = React.useMemo(() => {
    const counts = new Map<string, number>();

    for (const item of loginHistories) {
      if (!item?.loginDate) continue;

      const date = startOfDay(new Date(item.loginDate));
      if (isNaN(date.getTime())) continue;
      if (date < startDate || date > endDate) continue;

      const key = getDateKey(date);
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    return counts;
  }, [loginHistories, startDate, endDate]);

  // Get max count for intensity calculation
  const maxCount = React.useMemo(() => {
    return Math.max(...Array.from(loginCounts.values()), 0);
  }, [loginCounts]);

  // Calculate intensity level (0-4)
  const getIntensityLevel = (count: number) => {
    if (count === 0) return 0;
    if (maxCount <= 4) return Math.min(count, 4);
    const ratio = count / maxCount;
    return Math.max(1, Math.ceil(ratio * 4));
  };

  // Build data grouped by month
  const monthGroups = React.useMemo(() => {
    const groups: MonthGroup[] = [];
    let currentDate = new Date(startDate);
    let currentMonthWeeks: CellData[][] = [];
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    const currentMonthNum = today.getMonth();
    const currentYearNum = today.getFullYear();

    // Calculate the actual start month (11 months ago from current month)
    const actualStartMonth = getStartOfMonth(today);
    actualStartMonth.setMonth(actualStartMonth.getMonth() - 11);
    const actualStartMonthNum = actualStartMonth.getMonth();
    const actualStartYearNum = actualStartMonth.getFullYear();

    while (currentDate <= endDate) {
      const weekData: CellData[] = [];

      // Add 7 days for the week, but only if they're within endDate
      for (let day = 0; day < 7; day++) {
        if (currentDate > endDate) break;

        const cellDate = new Date(currentDate);
        const dateKey = getDateKey(cellDate);
        const count = loginCounts.get(dateKey) || 0;
        const level = getIntensityLevel(count);
        const isFuture = cellDate > today;
        const isToday = dateKey === getDateKey(today);

        weekData.push({
          date: cellDate,
          count,
          level,
          isFuture,
          isToday
        });

        currentDate = addDays(currentDate, 1);
      }

      // Only process weeks that have at least one day within our range
      if (weekData.length === 0) break;

      // Determine which month this week belongs to based on majority of days in the week
      // Count days per month in this week
      const monthCounts = new Map<string, number>();
      for (const cell of weekData) {
        const monthKey = `${cell.date.getFullYear()}-${cell.date.getMonth()}`;
        monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
      }

      // Find the month with the most days
      let maxCount = 0;
      let weekMonth = weekData[0].date.getMonth();
      let weekYear = weekData[0].date.getFullYear();
      for (const [monthKey, count] of monthCounts.entries()) {
        if (count > maxCount) {
          maxCount = count;
          const [year, month] = monthKey.split('-').map(Number);
          weekYear = year;
          weekMonth = month;
        }
      }

      // Skip weeks that are before the actual start month (11 months ago)
      if (
        weekYear < actualStartYearNum ||
        (weekYear === actualStartYearNum && weekMonth < actualStartMonthNum)
      ) {
        continue;
      }

      // Skip weeks that are beyond the current month
      if (
        weekYear > currentYearNum ||
        (weekYear === currentYearNum && weekMonth > currentMonthNum)
      ) {
        break;
      }

      if (weekMonth !== currentMonth || weekYear !== currentYear) {
        // Save previous month
        if (currentMonthWeeks.length > 0) {
          const monthLabel = new Date(
            currentYear,
            currentMonth
          ).toLocaleDateString('vi-VN', {
            month: 'short'
          });
          groups.push({
            monthLabel,
            year: currentYear,
            month: currentMonth,
            weeks: currentMonthWeeks
          });
        }

        // Start new month
        currentMonth = weekMonth;
        currentYear = weekYear;
        currentMonthWeeks = [weekData];
      } else {
        currentMonthWeeks.push(weekData);
      }
    }

    // Add last month
    if (currentMonthWeeks.length > 0) {
      const monthLabel = new Date(currentYear, currentMonth).toLocaleDateString(
        'vi-VN',
        {
          month: 'short'
        }
      );
      groups.push({
        monthLabel,
        year: currentYear,
        month: currentMonth,
        weeks: currentMonthWeeks
      });
    }

    return groups;
  }, [startDate, endDate, loginCounts, today, maxCount]);

  // Tooltip state
  const [tooltip, setTooltip] = React.useState<{
    x: number;
    y: number;
    cell: CellData;
  } | null>(null);

  const handleMouseEnter = (e: React.MouseEvent, cell: CellData) => {
    setTooltip({ x: e.clientX, y: e.clientY, cell });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  // Color functions
  const getLevelColor = (level: number) => {
    switch (level) {
      case 0:
        return 'bg-gray-100 dark:bg-gray-800';
      case 1:
        return 'bg-orange-200 dark:bg-orange-950';
      case 2:
        return 'bg-orange-400 dark:bg-orange-800';
      case 3:
        return 'bg-orange-500 dark:bg-orange-600';
      case 4:
        return 'bg-orange-600 dark:bg-orange-500';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  const getCellClass = (cell: CellData) => {
    let classes =
      'relative rounded-sm cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg hover:z-10';

    if (cell.isFuture) {
      classes += ' bg-gray-50 dark:bg-gray-900 opacity-40';
    } else {
      classes += ` ${getLevelColor(cell.level)}`;
      if (cell.isToday) {
        classes += ' ring-2 ring-blue-500';
      }
    }

    return classes;
  };

  const weekdayLabels = ['T2', '', 'T4', '', 'T6', '', ''];

  // Refs for scrolling to current month
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const monthRefs = React.useRef<Map<number, HTMLDivElement>>(new Map());

  // Scroll to current month on mount and when monthGroups change
  React.useEffect(() => {
    if (!scrollContainerRef.current || monthGroups.length === 0) return;

    const currentMonthNum = today.getMonth();
    const currentYearNum = today.getFullYear();

    // Find the index of the current month
    const currentMonthIndex = monthGroups.findIndex(
      (group) =>
        group.year === currentYearNum && group.month === currentMonthNum
    );

    if (currentMonthIndex !== -1) {
      const monthElement = monthRefs.current.get(currentMonthIndex);
      if (monthElement && scrollContainerRef.current) {
        // Scroll to center the current month
        const container = scrollContainerRef.current;
        const containerRect = container.getBoundingClientRect();
        const elementRect = monthElement.getBoundingClientRect();
        const scrollLeft =
          elementRect.left -
          containerRect.left +
          container.scrollLeft -
          containerRect.width / 2 +
          elementRect.width / 2;

        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    }
  }, [monthGroups, today]);

  return (
    <div className="w-full rounded-lg border border-gray-200 p-4 dark:border-gray-700 dark:bg-gray-900 md:p-6">
      {/* Header */}
      <div className="mb-4 flex  flex-wrap items-center justify-between gap-3 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-xl md:text-2xl">📊</span>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 md:text-lg">
              Hoạt động đăng nhập
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 md:text-sm">
              12 tháng gần nhất
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 text-xs text-gray-600 dark:text-gray-400">
          <span className="hidden sm:inline">Ít</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`h-2.5 w-2.5 rounded-sm md:h-3 md:w-3 ${getLevelColor(level)}`}
              />
            ))}
          </div>
          <span className="hidden sm:inline">Nhiều</span>
        </div>
      </div>

      {/* Horizontal Months Container */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto bg-white p-4 pb-2 pl-0"
      >
        <div className="inline-flex min-w-max gap-3 md:gap-6">
          {/* Weekday Labels Column - Fixed */}
          <div className="sticky left-0 z-10 flex flex-shrink-0 flex-col gap-[3px] bg-white pt-6 text-[10px] text-gray-600 dark:bg-gray-900 dark:text-gray-400 md:text-xs">
            {weekdayLabels.map((label, i) => (
              <div
                key={i}
                className="flex h-[11px] w-5 items-center justify-end md:h-[14px] md:w-6"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Months arranged horizontally */}
          {monthGroups.map((monthGroup, monthIdx) => (
            <div
              key={monthIdx}
              ref={(el) => {
                if (el) {
                  monthRefs.current.set(monthIdx, el);
                } else {
                  monthRefs.current.delete(monthIdx);
                }
              }}
              className=" flex-shrink-0"
            >
              {/* Month Label */}
              <div className="mb-2 flex h-4 items-center text-[10px] font-semibold text-gray-700 dark:text-gray-300 md:text-xs">
                {monthGroup.monthLabel}
              </div>

              {/* Month Grid */}
              <div className="flex gap-[3px]">
                {monthGroup.weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-[3px]">
                    {week.map((cell, dayIdx) => (
                      <div
                        key={dayIdx}
                        className={`h-[11px] w-[11px] md:h-[14px] md:w-[14px] ${getCellClass(cell)}`}
                        onMouseEnter={(e) => handleMouseEnter(e, cell)}
                        onMouseLeave={handleMouseLeave}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-xl dark:border-gray-700 dark:bg-gray-800"
          style={{
            left: Math.min(tooltip.x + 10, window.innerWidth - 250),
            top: tooltip.y - 80
          }}
        >
          <div className="mb-1 flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded text-sm font-bold ${
                tooltip.cell.count > 0
                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {tooltip.cell.count}
            </span>
            <span className="whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
              {tooltip.cell.count > 0
                ? `${tooltip.cell.count} lần đăng nhập`
                : 'Không có hoạt động'}
            </span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {tooltip.cell.date.toLocaleDateString('vi-VN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      )}
    </div>
  );
}
