import { dateKey } from './date';
import type { DayEntry } from '../types';

/** Activity score for a day — powers the streak and the heatmap intensity. */
export function dayScore(entry: DayEntry | undefined): number {
  if (!entry) return 0;
  return entry.habitsDone.length + entry.sessions + (entry.intentionDone ? 1 : 0);
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
