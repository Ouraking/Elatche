/** The app-shell views. */
export type View = 'today' | 'focus' | 'consistency' | 'fuel';

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

/** A queued piece of work. Playing a task launches a focus session on it. */
export interface Task {
  id: string;
  label: string;
  done: boolean;
}

/** User preferences, persisted separately from daily history. */
export interface Settings {
  /** Timer durations, minutes. */
  focusMin: number;
  shortMin: number;
  longMin: number;
  /** Roll straight into the next queued session when one completes. */
  autoStart: boolean;
  /** Fire a desktop notification when a session completes. */
  notify: boolean;
  /** Daily deep-work target in minutes; 0 disables the goal. */
  dailyGoalMin: number;
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
  tasks: Task[];
  /** Task currently targeted by the Focus view, if any. */
  focusTaskId?: string;
}
