import { useMemo } from 'react';
import { dateKey } from '../lib/date';
import { dayScore } from '../lib/stats';
import type { DayEntry } from '../types';

const WEEKS = 12;
const TOTAL_DAYS = WEEKS * 7;

interface Cell {
  key: string;
  level: 0 | 1 | 2 | 3 | 4;
  title: string;
  spacer: boolean;
}

const levelFor = (score: number): Cell['level'] =>
  score === 0 ? 0 : score <= 1 ? 1 : score <= 3 ? 2 : score <= 5 ? 3 : 4;

interface ConsistencyProps {
  days: Record<string, DayEntry>;
}

export function Consistency({ days }: ConsistencyProps) {
  const cells = useMemo<Cell[]>(() => {
    const result: Cell[] = [];
    const start = new Date();
    start.setDate(start.getDate() - (TOTAL_DAYS - 1));

    // Pad so columns start on Sunday
    for (let i = 0; i < start.getDay(); i++) {
      result.push({ key: `pad-${i}`, level: 0, title: '', spacer: true });
    }

    const cursor = new Date(start);
    for (let i = 0; i < TOTAL_DAYS; i++) {
      const key = dateKey(cursor);
      const score = dayScore(days[key]);
      result.push({
        key,
        level: levelFor(score),
        title: `${cursor.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · ${
          score > 0 ? `${score} wins` : 'rest day'
        }`,
        spacer: false,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return result;
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
            <h2 className="font-display text-lg font-semibold text-white">Consistency</h2>
            <p className="text-xs text-muted">Last {WEEKS} weeks. Every square is a day you showed up.</p>
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

      <div className="grid grid-flow-col grid-rows-7 gap-[4px] overflow-x-auto pb-1">
        {cells.map((cell) => (
          <span
            key={cell.key}
            className="hm"
            data-l={cell.level || undefined}
            title={cell.title}
            style={cell.spacer ? { visibility: 'hidden' } : undefined}
          />
        ))}
      </div>
    </section>
  );
}
