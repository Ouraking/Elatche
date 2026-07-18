import { useMemo, type CSSProperties } from 'react';
import { dateKey, todayKey } from '../lib/date';
import { dayScore } from '../lib/stats';
import type { DayEntry } from '../types';

const WEEKS = 13;

interface Cell {
  key: string;
  level: 0 | 1 | 2 | 3 | 4;
  title: string;
  today: boolean;
  index: number;
}

interface Week {
  monthLabel: string | null;
  days: (Cell | null)[];
}

const WEEKDAY_LABELS = ['', 'M', '', 'W', '', 'F', ''];

const levelFor = (score: number): Cell['level'] =>
  score === 0 ? 0 : score <= 1 ? 1 : score <= 3 ? 2 : score <= 5 ? 3 : 4;

interface ConsistencyProps {
  days: Record<string, DayEntry>;
}

export function Consistency({ days }: ConsistencyProps) {
  const { weeks, activeCount } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startSunday = new Date(today);
    startSunday.setDate(today.getDate() - today.getDay() - (WEEKS - 1) * 7);

    const result: Week[] = [];
    const cursor = new Date(startSunday);
    let lastMonth = -1;
    let active = 0;
    let index = 0;

    for (let w = 0; w < WEEKS; w++) {
      const weekStartMonth = cursor.getMonth();
      const cells: (Cell | null)[] = [];
      for (let d = 0; d < 7; d++) {
        if (cursor > today) {
          cells.push(null);
        } else {
          const key = dateKey(cursor);
          const score = dayScore(days[key]);
          if (score > 0) active++;
          cells.push({
            key,
            level: levelFor(score),
            today: key === todayKey(),
            index: index++,
            title: `${cursor.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · ${
              score > 0 ? `${score} win${score === 1 ? '' : 's'}` : 'rest day'
            }`,
          });
        }
        cursor.setDate(cursor.getDate() + 1);
      }
      const monthLabel =
        weekStartMonth !== lastMonth
          ? new Date(today.getFullYear(), weekStartMonth, 1).toLocaleDateString(undefined, { month: 'short' })
          : null;
      lastMonth = weekStartMonth;
      result.push({ monthLabel, days: cells });
    }
    return { weeks: result, activeCount: active };
  }, [days]);

  return (
    <section className="card p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="M7 15l4-4 3 3 5-6" />
            </svg>
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-strong">Consistency</h2>
            <p className="text-xs text-muted">
              {activeCount > 0
                ? `${activeCount} active day${activeCount === 1 ? '' : 's'} in the last ${WEEKS} weeks.`
                : `Last ${WEEKS} weeks. Every square is a day you showed up.`}
            </p>
          </div>
        </div>
        <p className="flex items-center gap-1 text-xs text-muted">
          <span className="mr-1">Less</span>
          {([0, 1, 2, 3, 4] as const).map((l) => (
            <span key={l} className="hm inline-block" data-l={l || undefined} />
          ))}
          <span className="ml-1">More</span>
        </p>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="inline-block">
          {/* Month labels */}
          <div className="mb-1 flex gap-1 pl-[22px]">
            {weeks.map((wk, i) => (
              <div key={i} className="relative h-3 w-[13px]">
                {wk.monthLabel && (
                  <span className="absolute left-0 top-0 whitespace-nowrap text-[10px] font-medium text-muted">
                    {wk.monthLabel}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Weekday labels + week columns */}
          <div className="flex gap-1">
            <div className="flex w-[18px] flex-col gap-1 pr-1 text-[9px] leading-none text-faint">
              {WEEKDAY_LABELS.map((l, i) => (
                <span key={i} className="flex h-[13px] items-center">
                  {l}
                </span>
              ))}
            </div>
            {weeks.map((wk, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {wk.days.map((cell, di) =>
                  cell ? (
                    <span
                      key={cell.key}
                      className={`hm ${cell.today ? 'hm-today' : ''}`}
                      data-l={cell.level || undefined}
                      title={cell.title}
                      style={{ '--i': String(cell.index) } as CSSProperties}
                    />
                  ) : (
                    <span key={`e-${wi}-${di}`} className="h-[13px] w-[13px]" />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeCount === 0 && (
        <p className="mt-5 rounded-xl border border-dashed border-hairline-strong px-4 py-4 text-center text-sm text-muted">
          Your board is waiting. Complete a ritual or a focus session and today lights up.
        </p>
      )}
    </section>
  );
}
