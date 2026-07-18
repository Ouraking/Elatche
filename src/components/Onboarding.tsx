import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';

interface OnboardingProps {
  /** Called when the user finishes or skips. Passes a first intention if set. */
  onComplete: (intention: string | null) => void;
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const PILLARS = [
  {
    title: 'One Intention',
    body: 'Name the single thing today is for. Everything else is noise.',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" {...stroke}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'Daily Rituals',
    body: 'Small reps — move, read, plan. Checked off, compounded.',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" {...stroke}>
        <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    title: 'Deep Focus',
    body: 'A distraction-free timer with a breathing dial and quiet soundscapes.',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" {...stroke}>
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2 2M9 2h6" />
      </svg>
    ),
  },
  {
    title: 'Consistency',
    body: 'Every day you show up lights up a square. Watch the streak grow.',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" {...stroke}>
        <path d="M3 3v18h18" />
        <path d="M7 15l4-4 3 3 5-6" />
      </svg>
    ),
  },
];

const STEP_COUNT = 3;

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const finish = (): void => onComplete(draft.trim() || null);
  const next = (): void => setStep((s) => Math.min(STEP_COUNT - 1, s + 1));
  const back = (): void => setStep((s) => Math.max(0, s - 1));

  // Focus the intention field the moment its step appears.
  useEffect(() => {
    if (step === 1) requestAnimationFrame(() => textareaRef.current?.focus());
  }, [step]);

  // Escape skips the whole flow; Enter advances the welcome/summary steps.
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onComplete(null);
      } else if (e.key === 'Enter' && step !== 1 && !e.shiftKey) {
        e.preventDefault();
        step === STEP_COUNT - 1 ? finish() : next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, draft]);

  const handleIntentionSubmit = (e: FormEvent): void => {
    e.preventDefault();
    next();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-ink/80 px-5 py-10 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Elatche"
    >
      {/* Ambient atmosphere mirrors the app's editorial hero */}
      <div className="aurora pointer-events-none absolute inset-0">
        <span className="a1" />
        <span className="a2" />
        <span className="a3" />
      </div>
      <div className="grid-veil pointer-events-none absolute inset-0" />

      <div className="relative w-full max-w-xl">
        {/* Progress + skip */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-1.5" aria-hidden>
            {Array.from({ length: STEP_COUNT }, (_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ease-(--ease-spring) ${
                  i === step ? 'w-7 bg-accent' : i < step ? 'w-1.5 bg-accent/60' : 'w-1.5 bg-edge'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => onComplete(null)}
            className="press rounded-lg px-2.5 py-1 text-xs font-medium text-muted hover:text-fg"
          >
            Skip
          </button>
        </div>

        {/* Step 0 — Welcome */}
        {step === 0 && (
          <div key="s0" className="text-center">
            <div className="reveal mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-accent/15 ring-1 ring-accent/40" style={{ '--i': 0 } as CSSProperties}>
              <span className="h-4 w-4 animate-float rounded-[5px] bg-accent shadow-[0_0_20px_4px_color-mix(in_oklab,var(--t-accent)_70%,transparent)]" />
            </div>
            <p className="reveal mt-8 text-[11px] font-semibold uppercase tracking-[0.32em] text-muted" style={{ '--i': 1 } as CSSProperties}>
              Welcome to
            </p>
            <h1 className="reveal text-gradient mt-2 font-display text-6xl font-extrabold tracking-tight sm:text-7xl" style={{ '--i': 2 } as CSSProperties}>
              Elatche
            </h1>
            <p className="reveal mx-auto mt-6 max-w-md font-quote text-2xl italic leading-snug text-fg sm:text-[1.75rem]" style={{ '--i': 3 } as CSSProperties}>
              One intention. A few rituals. Deep, unbroken work — repeated until it compounds.
            </p>
            <div className="reveal mt-10 flex flex-col items-center gap-3" style={{ '--i': 4 } as CSSProperties}>
              <button
                type="button"
                onClick={next}
                className="press inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-sm font-bold text-white shadow-glow hover:bg-accent-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-glow"
              >
                Begin
                <svg className="h-4 w-4" viewBox="0 0 24 24" {...stroke}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
              <p className="text-xs text-muted">Takes about 20 seconds · everything stays in your browser</p>
            </div>
          </div>
        )}

        {/* Step 1 — First intention */}
        {step === 1 && (
          <form key="s1" onSubmit={handleIntentionSubmit} className="text-center">
            <p className="reveal text-[11px] font-semibold uppercase tracking-[0.32em] text-accent-soft" style={{ '--i': 0 } as CSSProperties}>
              Step one
            </p>
            <h2 className="reveal mt-3 font-display text-4xl font-bold tracking-tight text-strong sm:text-5xl" style={{ '--i': 1 } as CSSProperties}>
              What matters most today?
            </h2>
            <p className="reveal mx-auto mt-4 max-w-md text-sm text-muted" style={{ '--i': 2 } as CSSProperties}>
              Set your one objective. You can change it any time — the point is to choose.
            </p>
            <div className="reveal mx-auto mt-8 max-w-lg" style={{ '--i': 3 } as CSSProperties}>
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, 140))}
                rows={2}
                maxLength={140}
                placeholder="e.g. Ship the first draft — no distractions until it's done."
                className="w-full resize-none rounded-2xl border border-hairline bg-ink/50 px-5 py-4 text-center font-quote text-xl italic text-strong transition-colors placeholder:text-faint placeholder:not-italic focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/25"
              />
            </div>
            <div className="reveal mt-8 flex items-center justify-center gap-3" style={{ '--i': 4 } as CSSProperties}>
              <button
                type="button"
                onClick={back}
                className="press rounded-xl border border-hairline-strong px-5 py-3 text-sm font-semibold text-muted hover:border-accent/40 hover:text-strong"
              >
                Back
              </button>
              <button
                type="submit"
                className="press inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white shadow-glow hover:bg-accent-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-glow"
              >
                {draft.trim() ? 'Pin it' : 'Skip for now'}
                <svg className="h-4 w-4" viewBox="0 0 24 24" {...stroke}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
            </div>
          </form>
        )}

        {/* Step 2 — How it works */}
        {step === 2 && (
          <div key="s2" className="text-center">
            <p className="reveal text-[11px] font-semibold uppercase tracking-[0.32em] text-accent-soft" style={{ '--i': 0 } as CSSProperties}>
              You're all set
            </p>
            <h2 className="reveal mt-3 font-display text-4xl font-bold tracking-tight text-strong sm:text-5xl" style={{ '--i': 1 } as CSSProperties}>
              Four moves, every day
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
              {PILLARS.map((p, i) => (
                <div
                  key={p.title}
                  className="reveal card flex items-start gap-3.5 p-4"
                  style={{ '--i': i + 2 } as CSSProperties}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
                    {p.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-strong">{p.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted">{p.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="reveal mt-9 flex items-center justify-center gap-3" style={{ '--i': 6 } as CSSProperties}>
              <button
                type="button"
                onClick={back}
                className="press rounded-xl border border-hairline-strong px-5 py-3 text-sm font-semibold text-muted hover:border-accent/40 hover:text-strong"
              >
                Back
              </button>
              <button
                type="button"
                onClick={finish}
                className="press inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-sm font-bold text-white shadow-glow hover:bg-accent-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-glow"
              >
                Enter Elatche
                <svg className="h-4 w-4" viewBox="0 0 24 24" {...stroke}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
            </div>
          </div>
        )}

        <a
          href="https://ouragrove.io"
          target="_blank"
          rel="noopener noreferrer"
          className="press group mt-12 flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-wide text-faint transition-colors hover:text-accent-soft"
        >
          <svg className="h-3.5 w-3.5 text-accent/70 transition-colors group-hover:text-accent-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22V11" />
            <path d="M12 11C12 7 9 5 5 5c0 4 3 6 7 6z" />
            <path d="M12 13c0-3 2.5-5 6-5 0 3.5-2.5 5-6 5z" />
          </svg>
          An <span className="text-muted transition-colors group-hover:text-accent-soft">OuraGrove</span> product
        </a>
      </div>
    </div>
  );
}
