import { useCallback, useEffect, useRef, useState } from 'react';
import { playCompletionTone } from '../lib/audio';
import { formatSeconds } from '../lib/date';
import { sendNotification } from '../lib/notify';
import type { TimerMode } from '../types';

const SESSIONS_PER_LONG_BREAK = 4;

export interface Timer {
  mode: TimerMode;
  remaining: number;
  totalSeconds: number;
  running: boolean;
  justCompleted: boolean;
  progress: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  selectMode: (mode: TimerMode) => void;
  /** Switch to focus mode and start a fresh session in one step. */
  startFocusSession: () => void;
}

interface UseTimerOptions {
  /** Minutes per mode — user-configurable via Settings. */
  durations: Record<TimerMode, number>;
  sessionsToday: number;
  autoStart: boolean;
  notify: boolean;
  onSessionComplete: (minutes: number) => void;
}

/**
 * App-level Pomodoro engine. Lives above the view layer so a running
 * countdown survives navigation. Drift-free (wall-clock deadline), queues the
 * next mode on completion — focus → break → focus, with a long break every
 * fourth session — optionally auto-starting it, and mirrors the countdown
 * into the tab title.
 */
export function useTimer({ durations, sessionsToday, autoStart, notify, onSessionComplete }: UseTimerOptions): Timer {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [remaining, setRemaining] = useState(durations.focus * 60);
  const [running, setRunning] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const endAtRef = useRef(0);
  const finishedRef = useRef(false);

  const totalSeconds = durations[mode] * 60;

  /* Duration settings changed while idle: re-arm the current mode. */
  const durationKey = `${durations.focus}-${durations.short}-${durations.long}`;
  const prevDurationKey = useRef(durationKey);
  useEffect(() => {
    if (prevDurationKey.current !== durationKey) {
      prevDurationKey.current = durationKey;
      if (!running) setRemaining(durations[mode] * 60);
    }
  }, [durationKey, running, durations, mode]);

  useEffect(() => {
    if (!running) return;
    finishedRef.current = false;

    const tick = (): void => {
      const left = Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0 && !finishedRef.current) {
        finishedRef.current = true;
        playCompletionTone();
        setJustCompleted(true);
        setTimeout(() => setJustCompleted(false), 600);

        let next: TimerMode;
        if (mode === 'focus') {
          onSessionComplete(durations.focus);
          next = (sessionsToday + 1) % SESSIONS_PER_LONG_BREAK === 0 ? 'long' : 'short';
        } else {
          next = 'focus';
        }

        if (notify) {
          sendNotification(
            mode === 'focus' ? 'Focus session complete' : 'Break over',
            mode === 'focus'
              ? `+${durations.focus} minutes logged. ${autoStart ? 'Break running.' : 'Break queued.'}`
              : `Back to the work. ${autoStart ? 'Focus running.' : 'Focus queued.'}`,
          );
        }

        const nextSeconds = durations[next] * 60;
        setMode(next);
        setRemaining(nextSeconds);
        if (autoStart) {
          endAtRef.current = Date.now() + nextSeconds * 1000;
          finishedRef.current = false;
        } else {
          setRunning(false);
        }
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
  }, [running, mode, sessionsToday, durations, autoStart, notify, onSessionComplete]);

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

  const reset = useCallback((): void => {
    setRunning(false);
    setRemaining(totalSeconds);
  }, [totalSeconds]);

  const selectMode = useCallback(
    (next: TimerMode): void => {
      setMode(next);
      setRunning(false);
      setRemaining(durations[next] * 60);
    },
    [durations],
  );

  const startFocusSession = useCallback((): void => {
    const seconds = durations.focus * 60;
    setMode('focus');
    setRemaining(seconds);
    endAtRef.current = Date.now() + seconds * 1000;
    setRunning(true);
  }, [durations]);

  return {
    mode,
    remaining,
    totalSeconds,
    running,
    justCompleted,
    progress: totalSeconds > 0 ? (totalSeconds - remaining) / totalSeconds : 0,
    start,
    pause,
    reset,
    selectMode,
    startFocusSession,
  };
}
