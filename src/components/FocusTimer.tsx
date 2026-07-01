import { useCallback, useEffect, useRef, useState } from 'react';
import { TIMER_MODES, TIMER_MODE_ORDER } from '../data';
import { useHotkeys } from '../hooks/useHotkeys';
import { playCompletionTone } from '../lib/audio';
import { formatSeconds } from '../lib/date';
import type { TimerMode } from '../types';

const RING_LENGTH = 339.29; // 2πr with r=54

interface FocusTimerProps {
  sessionsToday: number;
  zen: boolean;
  intention: string | undefined;
  onSessionComplete: (minutes: number) => void;
  onRunningChange: (running: boolean) => void;
}

export function FocusTimer({ sessionsToday, zen, intention, onSessionComplete, onRunningChange }: FocusTimerProps) {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [remaining, setRemaining] = useState(TIMER_MODES.focus.minutes * 60);
  const [running, setRunning] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const endAtRef = useRef(0);
  const finishedRef = useRef(false);

  const totalSeconds = TIMER_MODES[mode].minutes * 60;

  useEffect(() => {
    onRunningChange(running);
  }, [running, onRunningChange]);

  /* Drift-free countdown: derive from a wall-clock deadline, not tick counts. */
  useEffect(() => {
    if (!running) return;
    finishedRef.current = false;

    const tick = (): void => {
      const left = Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0 && !finishedRef.current) {
        finishedRef.current = true;
        setRunning(false);
        if (mode === 'focus') onSessionComplete(TIMER_MODES.focus.minutes);
        playCompletionTone();
        setJustCompleted(true);
        setTimeout(() => setJustCompleted(false), 600);
      }
    };

    const id = setInterval(tick, 250);
    const onVisible = (): void => {
      if (!document.hidden) tick();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [running, mode, onSessionComplete]);

  /* Countdown in the tab title while running. */
  useEffect(() => {
    document.title = running ? `${formatSeconds(remaining)} · Elatche` : 'Elatche';
    return () => {
      document.title = 'Elatche';
    };
  }, [running, remaining]);

  const start = useCallback((): void => {
    if (remaining <= 0) return;
    endAtRef.current = Date.now() + remaining * 1000;
    setRunning(true);
  }, [remaining]);

  const pause = useCallback((): void => setRunning(false), []);

  const toggle = useCallback((): void => {
    if (running) pause();
    else start();
  }, [running, pause, start]);

  const reset = useCallback((): void => {
    setRunning(false);
    setRemaining(totalSeconds);
  }, [totalSeconds]);

  const selectMode = (next: TimerMode): void => {
    setMode(next);
    setRunning(false);
    setRemaining(TIMER_MODES[next].minutes * 60);
  };

  // [Space] start/pause · [R] reset — globally, bypassing inputs
  useHotkeys({ space: toggle, r: reset });

  const progress = totalSeconds > 0 ? (totalSeconds - remaining) / totalSeconds : 0;

  return (
    <article className="card p-6 sm:p-8">
      {zen && intention && (
        <p className="mb-6 text-center text-sm font-semibold text-accent-soft">
          <span className="mr-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">Locked in on</span>
          {intention}
        </p>
      )}

      <div className={`flex flex-col items-center gap-8 ${zen ? '' : 'lg:flex-row lg:justify-between'}`}>
        <div className={zen ? 'text-center' : 'text-center lg:text-left'}>
          <div className={`mb-4 flex items-center justify-center gap-3 ${zen ? '' : 'lg:justify-start'}`}>
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="13" r="8" />
                <path d="M12 9v4l2 2M9 2h6" />
              </svg>
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-white">Focus Timer</h2>
              <p className="text-xs text-muted">Time-box the deep work.</p>
            </div>
          </div>

          <div className="inline-flex rounded-xl border border-white/[0.06] bg-ink/60 p-1" role="tablist" aria-label="Timer mode">
            {TIMER_MODE_ORDER.map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => selectMode(m)}
                className={`press rounded-lg px-4 py-1.5 text-sm font-semibold ${
                  mode === m ? 'bg-accent text-white' : 'text-muted hover:text-slate-200'
                }`}
              >
                {TIMER_MODES[m].label}
              </button>
            ))}
          </div>

          <p className="mt-5 text-sm text-muted">
            Sessions completed today: <span className="font-mono font-bold text-accent-soft">{sessionsToday}</span>
          </p>
        </div>

        <div className="relative grid h-64 w-64 shrink-0 place-items-center">
          <svg className="timer-ring absolute inset-0 h-64 w-64" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#161c2b" strokeWidth="6" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="url(#timer-gradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={RING_LENGTH}
              strokeDashoffset={(RING_LENGTH * (1 - progress)).toFixed(2)}
            />
            <defs>
              <linearGradient id="timer-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="text-center">
            <div
              className={`font-mono text-5xl font-bold tabular-nums tracking-tight text-white ${
                running ? 'animate-breathe' : ''
              } ${justCompleted ? 'animate-reward' : ''}`}
            >
              {formatSeconds(remaining)}
            </div>
            <div className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-muted">
              {TIMER_MODES[mode].tabLabel}
            </div>
          </div>
        </div>

        <div className={`flex items-center gap-3 ${zen ? '' : 'lg:flex-col'}`}>
          <button
            type="button"
            onClick={running ? pause : start}
            className="press inline-flex w-32 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white shadow-glow hover:bg-accent-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-glow"
          >
            {running ? (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
            {running ? 'Pause' : 'Start'}
          </button>
          <button
            type="button"
            onClick={reset}
            className="press inline-flex w-32 items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-5 py-3 text-sm font-semibold text-slate-300 hover:border-accent/50 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />
            </svg>
            Reset
          </button>
        </div>
      </div>
    </article>
  );
}
