import { TIMER_MODES, TIMER_MODE_ORDER } from '../data';
import { formatSeconds } from '../lib/date';
import type { Timer } from '../hooks/useTimer';
import type { Task, TimerMode } from '../types';

const RING_LENGTH = 597.6; // 2πr with r=95.1 (viewBox 200)
const SESSION_SLOTS = 4;

interface FocusViewProps {
  timer: Timer;
  durations: Record<TimerMode, number>;
  intention: string | undefined;
  focusTask: Task | undefined;
  onCompleteTask: (id: string) => void;
  sessionsToday: number;
  ambientOn: boolean;
  onToggleAmbient: () => void;
}

export function FocusView({
  timer,
  durations,
  intention,
  focusTask,
  onCompleteTask,
  sessionsToday,
  ambientOn,
  onToggleAmbient,
}: FocusViewProps) {
  const endsAt = new Date(Date.now() + timer.remaining * 1000).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dotSlots = Math.max(SESSION_SLOTS, sessionsToday);

  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col items-center justify-center text-center">
      {/* What you're locked in on */}
      {focusTask ? (
        <div className="mb-8 flex max-w-xl items-center gap-3 rounded-full border border-accent/40 bg-accent/10 py-2 pl-4 pr-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">Next up</span>
          <span className="min-w-0 truncate font-quote text-lg italic text-strong">{focusTask.label}</span>
          <button
            type="button"
            onClick={() => onCompleteTask(focusTask.id)}
            title="Mark this task done"
            className="press flex shrink-0 items-center gap-1.5 rounded-full border border-accent/50 px-3 py-1 text-xs font-semibold text-accent-soft hover:bg-accent hover:text-white"
          >
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Done
          </button>
        </div>
      ) : intention ? (
        <p className="mb-8 max-w-xl px-4">
          <span className="mr-2 text-[11px] font-medium uppercase tracking-[0.22em] text-muted">Locked in on</span>
          <span className="font-quote text-lg italic text-fg">{intention}</span>
        </p>
      ) : (
        <p className="mb-8 text-sm text-muted">No intention pinned. Set one on Today to aim this session.</p>
      )}

      {/* Mode selector */}
      <div className="inline-flex rounded-xl border border-hairline bg-ink/60 p-1" role="tablist" aria-label="Timer mode">
        {TIMER_MODE_ORDER.map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={timer.mode === m}
            onClick={() => timer.selectMode(m)}
            className={`press rounded-lg px-4 py-1.5 text-sm font-semibold ${
              timer.mode === m ? 'bg-accent text-white' : 'text-muted hover:text-fg'
            }`}
          >
            {TIMER_MODES[m].label} · {durations[m]}
          </button>
        ))}
      </div>

      {/* The dial */}
      <div className="relative mt-6 grid h-[22rem] w-[22rem] place-items-center sm:h-[26rem] sm:w-[26rem]">
        <img
          src="/images/focus-atmosphere.png"
          alt=""
          aria-hidden
          className={`focus-photo rounded-full ${timer.running ? 'is-running' : ''}`}
        />
        <div className={`focus-orb ${timer.running ? 'is-running' : ''}`} />
        <svg
          className={`timer-ring absolute inset-0 h-full w-full ${timer.running ? 'is-running' : ''}`}
          viewBox="0 0 200 200"
        >
          <circle cx="100" cy="100" r="95.1" fill="none" className="stroke-edge" strokeWidth="5" />
          <circle
            cx="100"
            cy="100"
            r="95.1"
            fill="none"
            stroke="url(#focus-gradient)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={RING_LENGTH}
            strokeDashoffset={(RING_LENGTH * (1 - timer.progress)).toFixed(2)}
          />
          <defs>
            <linearGradient id="focus-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" style={{ stopColor: 'var(--t-accent-glow)' }} />
              <stop offset="100%" style={{ stopColor: 'var(--t-accent)' }} />
            </linearGradient>
          </defs>
        </svg>

        <div className="relative text-center">
          <div
            className={`font-mono text-7xl font-bold tabular-nums tracking-tight text-strong sm:text-8xl ${
              timer.running ? 'animate-breathe' : ''
            } ${timer.justCompleted ? 'animate-reward' : ''}`}
          >
            {formatSeconds(timer.remaining)}
          </div>
          <div className="mt-2 text-xs font-medium uppercase tracking-[0.3em] text-muted">
            {TIMER_MODES[timer.mode].tabLabel}
          </div>
          <div
            className={`mt-2 text-xs text-muted transition-opacity duration-500 ${
              timer.running ? 'opacity-100' : 'opacity-0'
            }`}
          >
            ends {endsAt}
          </div>
        </div>
      </div>

      {/* Session dots */}
      <div
        className="mt-2 flex items-center gap-2"
        title={`${sessionsToday} session${sessionsToday === 1 ? '' : 's'} completed today`}
      >
        {Array.from({ length: dotSlots }, (_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full transition-all duration-500 ease-(--ease-spring) ${
              i < sessionsToday ? 'scale-110 bg-accent shadow-[0_0_8px_color-mix(in_oklab,var(--t-accent)_60%,transparent)]' : 'bg-edge'
            }`}
          />
        ))}
        <span className="ml-1.5 text-xs text-muted">
          {sessionsToday}/{dotSlots} today
        </span>
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={timer.running ? timer.pause : timer.start}
          className="press inline-flex w-36 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 text-sm font-bold text-white shadow-glow hover:bg-accent-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-glow"
        >
          {timer.running ? (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
          {timer.running ? 'Pause' : 'Start'}
        </button>
        <button
          type="button"
          onClick={timer.reset}
          title="Reset · press R"
          className="press inline-flex items-center justify-center gap-2 rounded-xl border border-hairline-strong px-5 py-3.5 text-sm font-semibold text-fg hover:border-accent/50 hover:text-strong"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />
          </svg>
          Reset
        </button>
        <button
          type="button"
          onClick={onToggleAmbient}
          aria-pressed={ambientOn}
          title={ambientOn ? 'Turn ambience off' : 'Turn ambience on — a low synthesized noise bed'}
          className={`press inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3.5 text-sm font-semibold ${
            ambientOn
              ? 'border-accent/60 bg-accent/10 text-accent-soft shadow-glow'
              : 'border-hairline-strong text-fg hover:border-accent/50 hover:text-strong'
          }`}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H2v6h4l5 4V5z" />
            {ambientOn ? <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14" /> : <path d="m16 9 6 6M22 9l-6 6" />}
          </svg>
          Ambience
        </button>
      </div>

      <p className="mt-6 text-xs text-muted">
        <kbd className="rounded border border-hairline-strong bg-ink/80 px-1.5 py-0.5 font-mono text-[11px] text-fg">Space</kbd>{' '}
        start / pause ·{' '}
        <kbd className="rounded border border-hairline-strong bg-ink/80 px-1.5 py-0.5 font-mono text-[11px] text-fg">R</kbd>{' '}
        reset ·{' '}
        <kbd className="rounded border border-hairline-strong bg-ink/80 px-1.5 py-0.5 font-mono text-[11px] text-fg">⌘K</kbd>{' '}
        commands
      </p>
    </div>
  );
}
