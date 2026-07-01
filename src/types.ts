/** The three Pomodoro modes supported by the Focus Timer. */
export type TimerMode = 'focus' | 'short' | 'long';

export interface TimerModeConfig {
  readonly label: string;
  readonly tabLabel: string;
  readonly minutes: number;
}

export interface Quote {
  readonly text: string;
  readonly author: string;
}

export interface Habit {
  readonly id: string;
  readonly label: string;
  readonly hint?: string;
  /** Built-in rituals cannot be deleted. */
  readonly fixed?: boolean;
}

export interface Video {
  readonly id: string;
  readonly title: string;
  readonly author: string;
}

/** Everything that happened on a single calendar day (keyed by YYYY-MM-DD). */
export interface DayEntry {
  intention?: string;
  intentionDone?: boolean;
  habitsDone: string[];
  sessions: number;
  focusMin: number;
}

/** The persisted root state. One record per day, plus the user's ritual list. */
export interface AppState {
  habits: Habit[];
  days: Record<string, DayEntry>;
}
