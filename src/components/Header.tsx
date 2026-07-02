import { useEffect, useState } from 'react';
import { formatSeconds } from '../lib/date';
import type { Theme } from '../services/storage';

interface HeaderProps {
  intention: string | undefined;
  intentionDone: boolean;
  streak: number;
  timerRunning: boolean;
  timerRemaining: number;
  showMiniTimer: boolean;
  onMiniTimerClick: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function Header({
  intention,
  intentionDone,
  streak,
  timerRunning,
  timerRemaining,
  showMiniTimer,
  onMiniTimerClick,
  theme,
  onToggleTheme,
}: HeaderProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);

  const secondsIntoDay = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const dayProgress = (secondsIntoDay / 86_400) * 100;

  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-ink/70 backdrop-blur-xl">
      <div className="flex items-center gap-4 px-5 py-3 sm:px-8">
        <span className="font-display text-lg font-bold tracking-tight text-strong md:hidden">Elatche</span>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">Today's Intention</p>
          <p
            aria-live="polite"
            className={`truncate text-sm ${
              intention
                ? intentionDone
                  ? 'font-semibold text-accent-glow line-through decoration-accent/50'
                  : 'font-semibold text-strong'
                : 'font-medium text-muted'
            }`}
          >
            {intention ? `${intentionDone ? '✓ ' : ''}${intention}` : 'Set your one intention →'}
          </p>
        </div>

        {/* Live countdown chip when the timer runs outside the Focus view */}
        {timerRunning && showMiniTimer && (
          <button
            type="button"
            onClick={onMiniTimerClick}
            title="Return to Focus"
            className="press hidden items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 shadow-glow sm:flex"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-glow" />
            <span className="font-mono text-sm font-bold tabular-nums text-strong">
              {formatSeconds(timerRemaining)}
            </span>
          </button>
        )}

        <div
          className="hidden items-center gap-1.5 rounded-full border border-hairline bg-panel/60 px-3 py-1.5 sm:flex"
          title="Current streak"
        >
          <span className="animate-flicker text-sm">🔥</span>
          <span className="font-mono text-sm font-bold text-strong">{streak}</span>
          <span className="text-xs text-muted">day streak</span>
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme · press T`}
          className="press grid h-9 w-9 shrink-0 place-items-center rounded-full border border-hairline text-muted hover:border-accent/40 hover:text-strong"
        >
          {theme === 'light' ? (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          )}
        </button>

        <div className="hidden text-right lg:block">
          <p className="font-mono text-xs text-muted">
            {now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
          <p className="font-mono text-sm text-fg">
            {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Ambient day-progress hairline: how much of today has burned */}
      <div
        className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-accent-glow/60 to-accent transition-[width] duration-1000"
        style={{ width: `${dayProgress}%` }}
        title={`${Math.round(dayProgress)}% of today elapsed`}
      />
    </header>
  );
}
