import { DEFAULT_HABITS } from '../data';
import type { AppState, DayEntry, Habit } from '../types';

/**
 * Type-safe localStorage facade. Every read is parsed, validated against a
 * type guard, and falls back gracefully — a corrupt or missing key can never
 * crash the app or leak a mistyped value into state.
 */
const storage = {
  read<T>(key: string, fallback: T, guard?: (value: unknown) => value is T): T {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      const parsed: unknown = JSON.parse(raw);
      if (guard && !guard(parsed)) return fallback;
      return parsed as T;
    } catch {
      return fallback;
    }
  },

  write<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Quota exceeded or storage disabled — the session simply won't persist.
    }
  },
};

/* ---------- Persisted keys ---------- */

/** Current schema. Kept identical to the pre-React build so data survives the migration. */
const STATE_KEY = 'elatche.v2';

/** Legacy v1 keys (single-day schema from the original monolith). */
const V1 = {
  date: 'elatche.date',
  intention: 'elatche.intention',
  habits: 'elatche.habits',
  sessions: 'elatche.sessions',
} as const;

/* ---------- Type guards ---------- */

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isHabit = (v: unknown): v is Habit =>
  isRecord(v) && typeof v.id === 'string' && typeof v.label === 'string';

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string');

/** Accepts a loosely-shaped entry and normalizes it into a strict DayEntry. */
function normalizeDayEntry(v: unknown): DayEntry | null {
  if (!isRecord(v)) return null;
  const entry: DayEntry = {
    habitsDone: isStringArray(v.habitsDone) ? v.habitsDone : [],
    sessions: typeof v.sessions === 'number' && Number.isFinite(v.sessions) ? v.sessions : 0,
    focusMin: typeof v.focusMin === 'number' && Number.isFinite(v.focusMin) ? v.focusMin : 0,
  };
  if (typeof v.intention === 'string' && v.intention) entry.intention = v.intention;
  if (v.intentionDone === true) entry.intentionDone = true;
  return entry;
}

/* ---------- Load / save ---------- */

export function emptyDay(): DayEntry {
  return { habitsDone: [], sessions: 0, focusMin: 0 };
}

/** One-time import of the original single-day schema, if present. */
function migrateV1(): Record<string, DayEntry> {
  const date = storage.read<string | null>(V1.date, null, (v): v is string | null => typeof v === 'string');
  if (!date) return {};

  const entry = emptyDay();
  entry.sessions = storage.read<number>(V1.sessions, 0, (v): v is number => typeof v === 'number');

  const intention = storage.read<string>(V1.intention, '', (v): v is string => typeof v === 'string');
  if (intention) entry.intention = intention;

  const flags = storage.read<boolean[]>(V1.habits, [], (v): v is boolean[] =>
    Array.isArray(v) && v.every((x) => typeof x === 'boolean'),
  );
  flags.forEach((on, i) => {
    const habit = DEFAULT_HABITS[i];
    if (on && habit) entry.habitsDone.push(habit.id);
  });

  return { [date]: entry };
}

export function loadAppState(): AppState {
  const raw = storage.read<unknown>(STATE_KEY, null);

  if (isRecord(raw) && isRecord(raw.days)) {
    const habits = Array.isArray(raw.habits) ? raw.habits.filter(isHabit) : [];
    const days: Record<string, DayEntry> = {};
    for (const [key, value] of Object.entries(raw.days)) {
      const entry = normalizeDayEntry(value);
      if (entry) days[key] = entry;
    }
    return { habits: habits.length > 0 ? habits : [...DEFAULT_HABITS], days };
  }

  return { habits: [...DEFAULT_HABITS], days: migrateV1() };
}

export function saveAppState(state: AppState): void {
  storage.write(STATE_KEY, state);
}
