import { useEffect, useMemo, useRef, useState } from 'react';

export interface Command {
  id: string;
  label: string;
  hint?: string;
  run: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  commands: Command[];
  onClose: () => void;
}

export function CommandPalette({ open, commands, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q) || c.hint?.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      // Focus after the entrance frame paints
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  if (!open) return null;

  const runCommand = (index: number): void => {
    const command = matches[index];
    if (!command) return;
    onClose();
    command.run();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/60 px-4 pt-[18vh] backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="animate-toast-in w-full max-w-lg overflow-hidden rounded-2xl border border-hairline-strong bg-panel/95 shadow-[0_40px_80px_-20px_rgba(0,0,0,.5),0_0_0_1px_color-mix(in_oklab,var(--t-accent)_15%,transparent)] backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-hairline px-4">
          <svg className="h-4 w-4 shrink-0 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelected((s) => Math.min(s + 1, matches.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelected((s) => Math.max(s - 1, 0));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                runCommand(selected);
              } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
              }
            }}
            placeholder="Type a command…"
            className="w-full bg-transparent py-3.5 text-sm text-fg placeholder:text-faint focus:outline-none"
          />
          <kbd className="shrink-0 rounded border border-hairline-strong bg-ink/80 px-1.5 py-0.5 font-mono text-[10px] text-muted">esc</kbd>
        </div>

        <ul className="max-h-72 overflow-y-auto p-1.5">
          {matches.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-muted">Nothing matches "{query}"</li>
          )}
          {matches.map((command, i) => {
            const active = i === selected;
            return (
              <li key={command.id}>
                <button
                  type="button"
                  onClick={() => runCommand(i)}
                  onMouseEnter={() => setSelected(i)}
                  className={`relative flex w-full items-center justify-between gap-3 rounded-lg py-2.5 pl-4 pr-3 text-left text-sm transition-colors ${
                    active ? 'bg-accent/15 text-strong' : 'text-fg'
                  }`}
                >
                  {active && (
                    <span className="absolute left-1 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-accent shadow-[0_0_8px_color-mix(in_oklab,var(--t-accent)_70%,transparent)]" />
                  )}
                  <span className="font-medium">{command.label}</span>
                  {command.hint ? (
                    <span className="shrink-0 rounded border border-hairline-strong bg-ink/60 px-1.5 py-0.5 font-mono text-[10px] text-muted">
                      {command.hint}
                    </span>
                  ) : (
                    active && (
                      <span className="shrink-0 font-mono text-[11px] text-accent-soft">⏎</span>
                    )
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-4 border-t border-hairline px-4 py-2 text-[11px] text-muted">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-hairline-strong bg-ink/60 px-1 font-mono">↑</kbd>
            <kbd className="rounded border border-hairline-strong bg-ink/60 px-1 font-mono">↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-hairline-strong bg-ink/60 px-1 font-mono">⏎</kbd>
            select
          </span>
          <span className="ml-auto font-mono">{matches.length} action{matches.length === 1 ? '' : 's'}</span>
        </div>
      </div>
    </div>
  );
}
