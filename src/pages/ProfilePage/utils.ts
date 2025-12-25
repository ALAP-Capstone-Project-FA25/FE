type LoginHistory = {
  userId: number;
  loginDate: string; // ISO string
  ipAddress?: string;
  userAgent?: string;
  id?: number;
  createdAt?: string;
  updatedAt?: string;
};

const toLocalYmd = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const addDays = (date: Date, n: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

export const calculateLoginStats = (loginHistories: LoginHistory[] = []) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Count logins per date
  const countsByDate = new Map<string, number>();
  const weeks = 53;

  const startOfWeek = (date: Date, startsOn: 0 | 1) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day - startsOn + 7) % 7;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const endWeekStart = startOfWeek(today, 1);
  const rangeStart = addDays(endWeekStart, -(weeks - 1) * 7);

  for (const item of loginHistories) {
    if (!item?.loginDate) continue;
    const d = new Date(item.loginDate);
    if (Number.isNaN(d.getTime())) continue;
    if (d < rangeStart || d > addDays(endWeekStart, 6)) continue;
    const key = toLocalYmd(d);
    countsByDate.set(key, (countsByDate.get(key) ?? 0) + 1);
  }

  // Calculate statistics
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
};

