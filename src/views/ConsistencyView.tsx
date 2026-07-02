import { useMemo } from 'react';
import { Consistency } from '../components/Consistency';
import { useCountUp } from '../hooks/useCountUp';
import { computeRecords, weekSeries } from '../lib/stats';
import type { DayEntry } from '../types';

interface RecordCardProps {
  value: number;
  suffix?: string;
  label: string;
}

function RecordCard({ value, suffix, label }: RecordCardProps) {
  const shown = useCountUp(value);
  return (
    <div className="card px-4 py-4">
      <p className="font-mono text-2xl font-bold text-strong">
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

  return (
    <div className="space-y-6">
      {/* All-time records */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <RecordCard value={records.bestStreak} label="Best streak" />
        <RecordCard value={Math.round(records.totalFocusMin / 60)} suffix="h" label="Deep work, all time" />
        <RecordCard value={records.totalSessions} label="Total sessions" />
        <RecordCard value={records.activeDays} label="Days showed up" />
      </div>

      {/* Trailing 7 days */}
      <section className="card p-6 sm:p-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <p className="font-mono text-sm text-accent-soft">
            {Math.round(weekTotal)}<span className="text-muted">m total</span>
          </p>
        </div>

        <div className="flex h-36 items-end justify-between gap-2 sm:gap-4">
          {week.map((d) => (
            <div key={d.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className="font-mono text-[11px] text-muted">{d.focusMin > 0 ? Math.round(d.focusMin) : ''}</span>
              <div
                className={`w-full max-w-12 origin-bottom animate-bar-grow rounded-t-md ${
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
      </section>

      <Consistency days={days} />
    </div>
  );
}
