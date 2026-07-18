import { useEffect, useState, type ReactNode } from 'react';
import { TIMER_MODES, TIMER_MODE_ORDER } from '../data';
import { formatSeconds } from '../lib/date';
import type { Soundscape } from '../lib/audio';
import type { Timer } from '../hooks/useTimer';
import type { Task, TimerMode } from '../types';

const RING_LENGTH = 597.6; // 2πr with r=95.1 (viewBox 200)
const SESSION_SLOTS = 4;

interface SoundOption {
  kind: Soundscape;
  label: string;
  icon: ReactNode;
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const SOUNDSCAPES: SoundOption[] = [
  {
    kind: 'brown',
    label: 'Deep',
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" {...stroke}>
        <path d="M3 12h3l3-7 6 14 3-7h3" />
      </svg>
    ),
  },
  {
    kind: 'rain',
    label: 'Rain',
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" {...stroke}>
        <path d="M20 16.6A5 5 0 0 0 18 7h-1.3A8 8 0 1 0 4 15.2M8 19l-1 2M12 19l-1 2M16 19l-1 2" />
      </svg>
    ),
  },
  {
    kind: 'warm',
    label: 'Warm',
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" {...stroke}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
      </svg>
    ),
  },
];

/** The breathing timer dial: conic aura, orb, pulse rings, and the SVG progress ring. */
function TimerDial({ timer, endsAt, sizeClass }: { timer: Timer; endsAt: string; sizeClass: string }) {
  const running = timer.running;
  return (
    <div className={`relative grid place-items-center ${sizeClass}`}>
      <div className={`focus-aura ${running ? 'is-running' : ''}`} />
      <div className={`focus-orb ${running ? 'is-running' : ''}`} />
      {running && (
        <>
          <span className="breath-ring" style={{ animationDelay: '0s' }} />
          <span className="breath-ring" style={{ animationDelay: '2s' }} />
        </>
      )}

      <svg className={`timer-ring absolute inset-0 h-full w-full ${running ? 'is-running' : ''}`} viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="95.1" fill="none" className="stroke-edge" strokeWidth="4" />
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
            running ? 'animate-breathe' : ''
          } ${timer.justCompleted ? 'animate-reward' : ''}`}
        >
          {formatSeconds(timer.remaining)}
        </div>
        <div className="mt-2 text-xs font-medium uppercase tracking-[0.3em] text-muted">
          {TIMER_MODES[timer.mode].tabLabel}
        </div>
        <div className={`mt-2 text-xs text-muted transition-opacity duration-500 ${running ? 'opacity-100' : 'opacity-0'}`}>
          ends {endsAt}
        </div>
      </div>
    </div>
  );
}

interface FocusViewProps {
  timer: Timer;
  durations: Record<TimerMode, number>;
  intention: string | undefined;
  focusTask: Task | undefined;
  onCompleteTask: (id: string) => void;
  sessionsToday: number;
  goalMin: number;
  focusMinToday: number;
  soundscape: Soundscape | null;
  onSelectSoundscape: (kind: Soundscape | null) => void;
}

export function FocusView({
  timer,
  durations,
  intention,
  focusTask,
  onCompleteTask,
  sessionsToday,
  goalMin,
  focusMinToday,
  soundscape,
  onSelectSoundscape,
}: FocusViewProps) {
  const [zen, setZen] = useState(false);

  const endsAt = new Date(Date.now() + timer.remaining * 1000).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dotSlots = Math.max(SESSION_SLOTS, sessionsToday);
  const goalPct = goalMin > 0 ? Math.min(100, (focusMinToday / goalMin) * 100) : 0;

  // Escape leaves Zen mode.
  useEffect(() => {
    if (!zen) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setZen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zen]);

  /* ---------- Zen: full-screen, distraction-free ---------- */
  if (zen) {
    return (
      <div className="fixed inset-0 z-[45] flex flex-col items-center justify-center bg-ink/95 backdrop-blur-2xl">
        <div className="aurora pointer-events-none absolute inset-0 opacity-70">
          <span className="a1" />
          <span className="a2" />
          <span className="a3" />
        </div>

        {intention && (
          <p className="relative mb-10 max-w-xl px-6 text-center font-quote text-xl italic text-fg">{intention}</p>
        )}

        <TimerDial timer={timer} endsAt={endsAt} sizeClass="h-[24rem] w-[24rem] sm:h-[30rem] sm:w-[30rem]" />

        <div className="relative mt-10 flex items-center gap-3">
          <button
            type="button"
            onClick={timer.running ? timer.pause : timer.start}
            className="press inline-flex w-36 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 text-sm font-bold text-white shadow-glow hover:bg-accent-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-glow"
          >
            {timer.running ? 'Pause' : 'Start'}
          </button>
          <button
            type="button"
            onClick={() => setZen(false)}
            className="press inline-flex items-center gap-2 rounded-xl border border-hairline-strong px-5 py-3.5 text-sm font-semibold text-fg hover:border-accent/50 hover:text-strong"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" {...stroke}>
              <path d="M9 9L4 4m0 0v4m0-4h4M15 9l5-5m0 0v4m0-4h-4M9 15l-5 5m0 0v-4m0 4h4M15 15l5 5m0 0v-4m0 4h-4" />
            </svg>
            Exit Zen
          </button>
        </div>
        <p className="relative mt-6 text-xs text-muted">
          <kbd className="rounded border border-hairline-strong bg-ink/80 px-1.5 py-0.5 font-mono text-[11px] text-fg">Esc</kbd>{' '}
          to leave
        </p>
      </div>
    );
  }

  /* ---------- Standard in-page focus environment ---------- */
  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col items-center justify-center text-center">
      {/* What you're locked in on */}
      {focusTask ? (
        <div className="mb-8 flex max-w-xl items-center gap-3 rounded-full border border-accent/40 bg-accent/10 py-2 pl-4 pr-2 shadow-glow">
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
              timer.mode === m ? 'bg-accent text-white shadow-glow' : 'text-muted hover:text-fg'
            }`}
          >
            {TIMER_MODES[m].label} · {durations[m]}
          </button>
        ))}
      </div>

      {/* The dial */}
      <div className="mt-6">
        <TimerDial timer={timer} endsAt={endsAt} sizeClass="h-[22rem] w-[22rem] sm:h-[26rem] sm:w-[26rem]" />
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

      {/* Daily-goal ribbon under the dial */}
      {goalMin > 0 && (
        <div className="mt-5 w-full max-w-xs">
          <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-muted">
            <span className="uppercase tracking-[0.18em]">Daily goal</span>
            <span className="font-mono tabular-nums">
              {Math.round(focusMinToday)}/{goalMin}m
            </span>
          </div>
          <div className="relative h-1.5 overflow-hidden rounded-full bg-ink/80">
            <div
              className={`h-full rounded-full transition-[width] duration-700 ease-(--ease-spring) ${
                goalPct >= 100
                  ? 'bg-gradient-to-r from-accent-glow to-accent shadow-[0_0_10px_color-mix(in_oklab,var(--t-accent)_55%,transparent)]'
                  : 'bg-accent/60'
              }`}
              style={{ width: `${Math.max(2, goalPct)}%` }}
            />
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
          onClick={() => setZen(true)}
          title="Enter distraction-free Zen mode"
          className="press inline-flex items-center justify-center gap-2 rounded-xl border border-hairline-strong px-5 py-3.5 text-sm font-semibold text-fg hover:border-accent/50 hover:text-strong"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" {...stroke}>
            <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
          Zen
        </button>
      </div>

      {/* Soundscape picker */}
      <div className="mt-6 inline-flex items-center gap-1 rounded-full border border-hairline bg-ink/50 p-1" role="group" aria-label="Ambient soundscape">
        <span className="px-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Sound</span>
        {SOUNDSCAPES.map((s) => {
          const active = soundscape === s.kind;
          return (
            <button
              key={s.kind}
              type="button"
              aria-pressed={active}
              onClick={() => onSelectSoundscape(s.kind)}
              title={active ? `Turn ${s.label} off` : `${s.label} soundscape`}
              className={`press inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                active
                  ? 'bg-accent text-white shadow-glow'
                  : 'text-muted hover:bg-veil hover:text-fg'
              }`}
            >
              {s.icon}
              {s.label}
            </button>
          );
        })}
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
