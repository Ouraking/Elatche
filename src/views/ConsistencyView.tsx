import { useMemo, type CSSProperties, type ReactNode } from 'react';
import { Consistency } from '../components/Consistency';
import { useCountUp } from '../hooks/useCountUp';
import { computeRecords, weekSeries } from '../lib/stats';
import type { DayEntry } from '../types';

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

interface RecordCardProps {
  value: number;
  index: number;
  icon: ReactNode;
  suffix?: string;
  label: string;
}

function RecordCard({ value, index, icon, suffix, label }: RecordCardProps) {
  const shown = useCountUp(value);
  return (
    <div className="card reveal px-4 py-4" style={{ '--i': index } as CSSProperties}>
      <span className="mb-3 grid h-8 w-8 place-items-center rounded-lg bg-accent/10 text-accent">{icon}</span>
      <p className="font-mono text-2xl font-bold tabular-nums text-strong">
        {shown}
        {suffix && <span className="text-sm text-muted">{suffix}</span>}
      </p>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{label}</p>
    </div>
  );
}

interface ConsistencyViewProps {
  days: Record<string, DayEntry>;
}

export function ConsistencyView({ days }: ConsistencyViewProps) {
  const records = useMemo(() => computeRecords(days), [days]);
  const week = useMemo(() => weekSeries(days), [days]);
  const weekMax = Math.max(25, ...week.map((d) => d.focusMin));
  const weekTotal = week.reduce((sum, d) => sum + d.focusMin, 0);
  const activeInWeek = week.filter((d) => d.focusMin > 0).length;
  const dailyAvg = activeInWeek > 0 ? weekTotal / activeInWeek : 0;
  const avgTopPct = 100 - (dailyAvg / weekMax) * 100;

  return (
    <div className="space-y-6">
      {/* All-time records */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <RecordCard
          index={0}
          value={records.bestStreak}
          label="Best streak"
          icon={
            <svg className="h-4 w-4" viewBox="0 0 24 24" {...stroke}>
              <path d="M12 2s5 4 5 9a5 5 0 0 1-10 0c0-1 .3-2 1-3 0 2 1 3 2 3 0-3 2-6 2-9z" />
            </svg>
          }
        />
        <RecordCard
          index={1}
          value={Math.round(records.totalFocusMin / 60)}
          suffix="h"
          label="Deep work, all time"
          icon={
            <svg className="h-4 w-4" viewBox="0 0 24 24" {...stroke}>
              <circle cx="12" cy="13" r="8" />
              <path d="M12 9v4l2 2M9 2h6" />
            </svg>
          }
        />
        <RecordCard
          index={2}
          value={records.totalSessions}
          label="Total sessions"
          icon={
            <svg className="h-4 w-4" viewBox="0 0 24 24" {...stroke}>
              <path d="M5 3v18M5 4h11l-2 3 2 3H5" />
            </svg>
          }
        />
        <RecordCard
          index={3}
          value={records.activeDays}
          label="Days showed up"
          icon={
            <svg className="h-4 w-4" viewBox="0 0 24 24" {...stroke}>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18M9 15l2 2 4-4" />
            </svg>
          }
        />
      </div>

      {/* Trailing 7 days */}
      <section className="card reveal p-6 sm:p-8" style={{ '--i': 4 } as CSSProperties}>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent">
              <svg className="h-5 w-5" viewBox="0 0 24 24" {...stroke}>
                <rect x="3" y="12" width="4" height="9" rx="1" />
                <rect x="10" y="7" width="4" height="14" rx="1" />
                <rect x="17" y="3" width="4" height="18" rx="1" />
              </svg>
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-strong">This Week</h2>
              <p className="text-xs text-muted">Focus minutes, trailing 7 days.</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm text-accent-soft">
              {Math.round(weekTotal)}
              <span className="text-muted">m total</span>
            </p>
            {dailyAvg > 0 && (
              <p className="font-mono text-[11px] text-muted">~{Math.round(dailyAvg)}m / active day</p>
            )}
          </div>
        </div>

        <div className="relative flex h-36 items-end justify-between gap-2 sm:gap-4">
          {/* Faint baseline gridlines */}
          <div aria-hidden className="pointer-events-none absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="h-px w-full bg-hairline" />
            ))}
          </div>

          {/* Average marker line */}
          {dailyAvg > 0 && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 flex items-center"
              style={{ top: `${Math.max(0, Math.min(100, avgTopPct))}%` }}
            >
              <span className="h-px w-full bg-[repeating-linear-gradient(to_right,color-mix(in_oklab,var(--t-accent-glow)_60%,transparent)_0_6px,transparent_6px_12px)]" />
              <span className="ml-1 shrink-0 rounded bg-panel/80 px-1 font-mono text-[9px] text-accent-soft">avg</span>
            </div>
          )}

          {week.map((d) => (
            <div key={d.key} className="group relative z-10 flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className="font-mono text-[11px] text-muted">{d.focusMin > 0 ? Math.round(d.focusMin) : ''}</span>
              <div
                className={`w-full max-w-12 origin-bottom animate-bar-grow rounded-t-md transition-[filter] duration-300 group-hover:brightness-110 ${
                  d.isToday
                    ? 'bg-gradient-to-t from-accent to-accent-glow shadow-[0_0_14px_color-mix(in_oklab,var(--t-accent)_45%,transparent)]'
                    : d.focusMin > 0
                      ? 'bg-accent/40'
                      : 'bg-edge'
                }`}
                style={{ height: `${Math.max(3, (d.focusMin / weekMax) * 100)}%` }}
                title={`${Math.round(d.focusMin)} focus minutes`}
              />
              <span className={`text-xs ${d.isToday ? 'font-bold text-accent-soft' : 'text-muted'}`}>{d.label}</span>
            </div>
          ))}
        </div>

        {weekTotal === 0 && (
          <p className="mt-5 text-center text-sm text-muted">
            No focus minutes yet this week. Start a session on Focus and this fills in.
          </p>
        )}
      </section>

      <div className="reveal" style={{ '--i': 5 } as CSSProperties}>
        <Consistency days={days} />
      </div>
    </div>
  );
}
