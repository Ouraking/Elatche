import { type CSSProperties } from 'react';
import { useCountUp } from '../hooks/useCountUp';

interface StatsStripProps {
  streak: number;
  focusMin: number;
  sessions: number;
  habitsDone: number;
  habitsTotal: number;
  /** Daily focus goal in minutes; 0 = no goal set. */
  goalMin: number;
}

interface StatCardProps {
  value: number;
  index: number;
  suffix?: string;
  label: string;
  icon?: string;
  primary?: boolean;
  /** 0..1 renders a progress bar under the value. */
  progress?: number;
}

function StatCard({ value, index, suffix, label, icon, primary = false, progress }: StatCardProps) {
  const shown = useCountUp(value);
  const complete = progress !== undefined && progress >= 1;
  return (
    <div
      className={`card reveal overflow-hidden px-4 py-4 ${
        primary ? 'border-accent/40 bg-accent/[0.08] shadow-glow' : ''
      }`}
      style={{ '--i': index } as CSSProperties}
    >
      <p className="flex items-baseline font-mono text-2xl font-bold text-strong">
        {icon && <span className="mr-1.5 inline-block animate-flicker align-middle text-lg leading-none">{icon}</span>}
        <span className="tabular-nums">{shown}</span>
        {suffix && <span className="text-sm text-muted">{suffix}</span>}
      </p>
      {progress !== undefined && (
        <div className="relative mt-2 h-1 overflow-hidden rounded-full bg-ink/80">
          <div
            className={`h-full rounded-full transition-[width] duration-700 ease-(--ease-spring) ${
              complete
                ? 'bg-gradient-to-r from-accent-glow to-accent shadow-[0_0_10px_color-mix(in_oklab,var(--t-accent)_50%,transparent)]'
                : 'bg-accent/60'
            }`}
            style={{ width: `${Math.min(100, progress * 100)}%` }}
          />
          {complete && <span className="progress-sheen" />}
        </div>
      )}
      <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{label}</p>
    </div>
  );
}

export function StatsStrip({ streak, focusMin, sessions, habitsDone, habitsTotal, goalMin }: StatsStripProps) {
  const focusProps =
    goalMin > 0
      ? { progress: focusMin / goalMin, label: `Focus · goal ${goalMin}m` }
      : { label: 'Focus today' };

  return (
    <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard index={0} value={streak} label="Day streak" icon="🔥" primary />
      <StatCard index={1} value={Math.round(focusMin)} suffix="m" {...focusProps} />
      <StatCard index={2} value={sessions} label="Sessions" />
      <StatCard index={3} value={habitsDone} suffix={`/${habitsTotal}`} label="Rituals done" />
    </div>
  );
}
