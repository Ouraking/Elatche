import { useState, type FormEvent } from 'react';
import type { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  focusTaskId: string | undefined;
  onAdd: (label: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onFocusTask: (id: string) => void;
}

export function TaskList({ tasks, focusTaskId, onAdd, onToggle, onRemove, onFocusTask }: TaskListProps) {
  const [label, setLabel] = useState('');
  const openCount = tasks.filter((t) => !t.done).length;

  const handleAdd = (e: FormEvent): void => {
    e.preventDefault();
    const text = label.trim();
    if (!text) return;
    onAdd(text);
    setLabel('');
  };

  return (
    <article className="card p-6 sm:p-7 lg:col-span-2">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 6h13M8 12h13M8 18h13" />
              <path d="M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-strong">Focus Queue</h2>
            <p className="text-xs text-muted">What deserves a session. Press play to lock in.</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm font-bold text-strong">{openCount}</p>
          <p className="text-[11px] text-muted">open</p>
        </div>
      </div>

      {tasks.length === 0 && (
        <p className="mb-4 rounded-xl border border-dashed border-hairline-strong px-4 py-6 text-center text-sm text-muted">
          Queue is empty. Add the work that matters, then hit play on one.
        </p>
      )}

      <ul className="space-y-2">
        {tasks.map((task) => {
          const isTarget = task.id === focusTaskId && !task.done;
          return (
            <li
              key={task.id}
              className={`group flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors ${
                isTarget
                  ? 'border-accent/50 bg-accent/10'
                  : 'border-hairline bg-ink/40 hover:border-accent/30'
              }`}
            >
              <button
                type="button"
                aria-pressed={task.done}
                title={task.done ? 'Reopen' : 'Mark done'}
                onClick={() => onToggle(task.id)}
                className={`press grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors ${
                  task.done ? 'border-accent bg-accent text-white' : 'border-edge text-transparent hover:border-accent/50'
                }`}
              >
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </button>

              <span
                className={`min-w-0 flex-1 truncate text-sm ${
                  task.done ? 'text-muted line-through decoration-accent/40' : 'font-medium text-fg'
                }`}
              >
                {task.label}
                {isTarget && (
                  <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-soft">
                    In focus
                  </span>
                )}
              </span>

              {!task.done && (
                <button
                  type="button"
                  title="Start a focus session on this"
                  onClick={() => onFocusTask(task.id)}
                  className="press grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-hairline text-muted opacity-0 transition-opacity hover:border-accent/50 hover:text-accent-soft focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <svg className="h-3.5 w-3.5 translate-x-[1px]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                title="Remove task"
                onClick={() => onRemove(task.id)}
                className="press shrink-0 rounded-md px-1.5 py-1 text-xs text-muted opacity-0 transition-opacity hover:text-red-400 focus-visible:opacity-100 group-hover:opacity-100"
              >
                ✕
              </button>
            </li>
          );
        })}
      </ul>

      <form onSubmit={handleAdd} className="mt-4 flex gap-2">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          maxLength={120}
          placeholder="Add work to the queue…"
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
