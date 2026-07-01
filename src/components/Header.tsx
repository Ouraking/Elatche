import { useEffect, useState } from 'react';

interface HeaderProps {
  intention: string | undefined;
  intentionDone: boolean;
  streak: number;
}

export function Header({ intention, intentionDone, streak }: HeaderProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3 sm:px-8">
        <a href="#top" className="group flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/15 ring-1 ring-accent/40">
            <span className="h-2.5 w-2.5 rounded-sm bg-accent shadow-[0_0_12px_2px_rgba(59,130,246,.8)] transition-transform duration-500 ease-(--ease-spring) group-hover:rotate-45" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-white">Elatche</span>
        </a>

        <div className="mx-1 hidden h-6 w-px bg-edge sm:block" />

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">Today's Intention</p>
          <p
            aria-live="polite"
            className={`truncate text-sm ${
              intention
                ? intentionDone
                  ? 'font-semibold text-accent-glow line-through decoration-accent/50'
                  : 'font-semibold text-white'
                : 'font-medium text-slate-400'
            }`}
          >
            {intention ? `${intentionDone ? '✓ ' : ''}${intention}` : 'Set your one intention below →'}
          </p>
        </div>

        <div
          className="hidden items-center gap-1.5 rounded-full border border-white/[0.06] bg-panel/60 px-3 py-1.5 md:flex"
          title="Current streak"
        >
          <span className="animate-flicker text-sm">🔥</span>
          <span className="font-mono text-sm font-bold text-white">{streak}</span>
          <span className="text-xs text-muted">day streak</span>
        </div>

        <div className="hidden text-right sm:block">
          <p className="font-mono text-xs text-muted">
            {now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
          <p className="font-mono text-sm text-slate-300">
            {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </header>
  );
}
