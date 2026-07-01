import { useEffect, useState, type FormEvent } from 'react';

const MAX_LENGTH = 140;

interface IntentionBoxProps {
  intention: string | undefined;
  intentionDone: boolean;
  onPin: (text: string) => void;
  onClear: () => void;
  onToggleDone: () => void;
}

export function IntentionBox({ intention, intentionDone, onPin, onClear, onToggleDone }: IntentionBoxProps) {
  const [draft, setDraft] = useState(intention ?? '');
  const [justPinned, setJustPinned] = useState(false);

  useEffect(() => {
    setDraft(intention ?? '');
  }, [intention]);

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onPin(text);
    setJustPinned(true);
    setTimeout(() => setJustPinned(false), 600);
  };

  return (
    <article className={`card p-6 sm:p-7 ${justPinned ? 'animate-reward' : ''}`}>
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="12" cy="12" r="0.5" fill="currentColor" />
          </svg>
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold text-white">The Intention Box</h2>
          <p className="text-xs text-muted">Your single primary objective for today.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, MAX_LENGTH))}
          rows={2}
          maxLength={MAX_LENGTH}
          placeholder="e.g. Ship the first draft — no distractions until it's done."
          className="w-full resize-none rounded-xl border border-white/[0.06] bg-ink/60 px-4 py-3 text-slate-100 transition-colors placeholder:text-slate-600 focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/25"
        />
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-muted">
            {draft.length} / {MAX_LENGTH}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClear}
              className="press rounded-lg px-3 py-2 text-sm font-medium text-muted hover:text-slate-200"
            >
              Clear
            </button>
            <button
              type="submit"
              className="press inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-glow"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 17v5M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
              </svg>
              Pin it
            </button>
          </div>
        </div>
      </form>

      {intention && (
        <button
          type="button"
          onClick={onToggleDone}
          className={`press mt-4 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold ${
            intentionDone
              ? 'border-accent/60 text-accent-soft'
              : 'border-white/[0.08] text-slate-300 hover:border-accent/50 hover:text-white'
          }`}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          {intentionDone ? 'Done. Well fought.' : 'Mark it done'}
        </button>
      )}
    </article>
  );
}
