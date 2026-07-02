import { dateKey } from './date';
import type { DayEntry } from '../types';

/** Activity score for a day — powers the streak and the heatmap intensity. */
export function dayScore(entry: DayEntry | undefined): number {
  if (!entry) return 0;
  return entry.habitsDone.length + entry.sessions + (entry.intentionDone ? 1 : 0);
}

export interface Records {
  bestStreak: number;
  totalSessions: number;
  totalFocusMin: number;
  activeDays: number;
}

export interface WeekDay {
  key: string;
  label: string;
  focusMin: number;
  isToday: boolean;
}

const nextDayKey = (key: string): string => {
  const [y = 0, m = 1, d = 1] = key.split('-').map(Number);
  return dateKey(new Date(y, m - 1, d + 1));
};

/** All-time records across the full history. */
export function computeRecords(days: Record<string, DayEntry>): Records {
  const activeKeys = Object.keys(days)
    .filter((k) => dayScore(days[k]) > 0)
    .sort();

  let bestStreak = 0;
  let run = 0;
  let prev: string | null = null;
  for (const key of activeKeys) {
    run = prev !== null && nextDayKey(prev) === key ? run + 1 : 1;
    bestStreak = Math.max(bestStreak, run);
    prev = key;
  }

  let totalSessions = 0;
  let totalFocusMin = 0;
  for (const entry of Object.values(days)) {
    totalSessions += entry.sessions;
    totalFocusMin += entry.focusMin;
  }

  return { bestStreak, totalSessions, totalFocusMin, activeDays: activeKeys.length };
}

/** Focus minutes per day for the trailing 7 days, oldest first. */
export function weekSeries(days: Record<string, DayEntry>): WeekDay[] {
  const result: WeekDay[] = [];
  const cursor = new Date();
  cursor.setDate(cursor.getDate() - 6);
  for (let i = 0; i < 7; i++) {
    const key = dateKey(cursor);
    result.push({
      key,
      label: cursor.toLocaleDateString(undefined, { weekday: 'narrow' }),
      focusMin: days[key]?.focusMin ?? 0,
      isToday: i === 6,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
}

/**
 * Consecutive active days ending today. An inactive today doesn't break a
 * streak that is still alive from yesterday.
 */
export function computeStreak(days: Record<string, DayEntry>): number {
  let streak = 0;
  const cursor = new Date();
  if (dayScore(days[dateKey(cursor)]) > 0) streak++;
  for (;;) {
    cursor.setDate(cursor.getDate() - 1);
    if (dayScore(days[dateKey(cursor)]) > 0) streak++;
    else break;
  }
  return streak;
}
