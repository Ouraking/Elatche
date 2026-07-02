import { useRef, useState, type FormEvent } from 'react';
import type { Habit } from '../types';

interface HabitTrackerProps {
  habits: Habit[];
  doneIds: string[];
  onToggle: (id: string) => void;
  onAdd: (label: string) => void;
  onRemove: (id: string) => void;
}

export function HabitTracker({ habits, doneIds, onToggle, onAdd, onRemove }: HabitTrackerProps) {
  const [newLabel, setNewLabel] = useState('');
  const [pulseId, setPulseId] = useState<string | null>(null);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleToggle = (id: string, wasDone: boolean): void => {
    onToggle(id);
    if (!wasDone) {
      setPulseId(id);
      clearTimeout(pulseTimer.current);
      pulseTimer.current = setTimeout(() => setPulseId(null), 600);
    }
  };

  const handleAdd = (e: FormEvent): void => {
    e.preventDefault();
    const label = newLabel.trim();
    if (!label) return;
    onAdd(label);
    setNewLabel('');
  };

  return (
    <article className="card p-6 sm:p-7">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-strong">Daily Rituals</h2>
            <p className="text-xs text-muted">Small reps. Compounded.</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm font-bold text-strong">
            {doneIds.length}/{habits.length}
          </p>
          <p className="text-[11px] text-muted">done</p>
        </div>
      </div>

      {/* Live completion bar */}
      <div className="mb-5 h-1 overflow-hidden rounded-full bg-ink/80">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-glow to-accent shadow-[0_0_10px_color-mix(in_oklab,var(--t-accent)_50%,transparent)] transition-[width] duration-700 ease-(--ease-spring)"
          style={{ width: `${habits.length > 0 ? (doneIds.length / habits.length) * 100 : 0}%` }}
        />
      </div>

      <ul className="space-y-2.5">
        {habits.map((habit) => {
          const done = doneIds.includes(habit.id);
          return (
            <li key={habit.id}>
              <button
                type="button"
                aria-pressed={done}
                onClick={() => handleToggle(habit.id, done)}
                className={`press group flex w-full items-center gap-3.5 rounded-xl border px-4 py-3 text-left ${
                  done
                    ? 'border-accent/50 bg-accent/10'
                    : 'border-hairline bg-ink/40 hover:border-accent/30 hover:bg-ink/70'
                } ${pulseId === habit.id && done ? 'animate-reward' : ''}`}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border transition-all duration-350 ease-(--ease-spring) ${
                    done ? 'scale-100 border-accent bg-accent text-white' : 'border-edge text-transparent'
                  }`}
                >
                  <svg
                    className={`h-3.5 w-3.5 transition-transform duration-350 ease-(--ease-spring) ${done ? 'scale-100' : 'scale-50'}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block text-sm font-semibold ${
                      done ? 'text-strong line-through decoration-accent/60' : 'text-fg'
                    }`}
                  >
                    {habit.label}
                  </span>
                  {habit.hint && <span className="block text-xs text-muted">{habit.hint}</span>}
                </span>
                {!habit.fixed && (
                  <span
                    role="button"
                    tabIndex={0}
                    title="Remove ritual"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(habit.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.stopPropagation();
                        onRemove(habit.id);
                      }
                    }}
                    className="shrink-0 rounded-md px-2 py-1 text-xs text-muted opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                  >
                    ✕
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <form onSubmit={handleAdd} className="mt-4 flex gap-2">
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          maxLength={48}
          placeholder="Add your own ritual…"
          className="min-w-0 flex-1 rounded-xl border border-hairline bg-ink/60 px-4 py-2.5 text-sm text-fg transition-colors placeholder:text-faint focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/25"
        />
        <button
          type="submit"
          className="press shrink-0 rounded-xl border border-hairline-strong px-4 py-2.5 text-sm font-semibold text-fg hover:border-accent/50 hover:text-strong"
        >
          + Add
        </button>
      </form>
    </article>
  );
}
