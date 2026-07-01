import { useCallback, useState } from 'react';
import { QUOTES } from '../data';
import { useHotkeys } from '../hooks/useHotkeys';

const greetingForHour = (h: number): string =>
  h < 12 ? 'Good morning.' : h < 18 ? 'Good afternoon.' : 'Good evening.';

const randomIndex = (exclude: number): number => {
  if (QUOTES.length < 2) return 0;
  let i = exclude;
  while (i === exclude) i = Math.floor(Math.random() * QUOTES.length);
  return i;
};

export function Hero() {
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const greeting = greetingForHour(new Date().getHours());
  const quote = QUOTES[quoteIndex] ?? QUOTES[0];

  const nextQuote = useCallback(() => setQuoteIndex((i) => randomIndex(i)), []);

  // [N] rotates the active quote
  useHotkeys({ n: nextQuote });

  return (
    <section className="relative isolate">
      <div className="aurora pointer-events-none absolute inset-0 overflow-hidden">
        <span className="a1" />
        <span className="a2" />
        <span className="a3" />
      </div>
      <div className="grid-veil pointer-events-none absolute inset-x-0 -top-6 h-[440px]" />

      <div className="relative animate-rise pt-16 pb-12 text-center sm:pt-24 sm:pb-16">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-panel/60 px-3.5 py-1.5 text-xs font-medium text-muted backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-glow" />
          {greeting} One day at a time.
        </span>

        {/* Keying on the index remounts the block, restarting the fade animation. */}
        <div key={quoteIndex}>
          <h1 className="mx-auto mt-7 max-w-3xl animate-fade-swap font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl">
            {quote?.text}
          </h1>
          <p className="mt-5 animate-fade-swap text-sm font-medium tracking-wide text-accent-soft">
            — {quote?.author}
          </p>
        </div>

        <div className="mt-9 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={nextQuote}
            className="press group inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-glow hover:bg-accent-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-glow"
          >
            <svg
              className="h-4 w-4 transition-transform duration-500 ease-(--ease-spring) group-hover:rotate-180"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
            </svg>
            New focus
          </button>
          <a
            href="#dashboard"
            className="press rounded-xl border border-white/[0.08] px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-accent/50 hover:text-white"
          >
            Begin →
          </a>
        </div>

        <p className="mt-6 hidden text-xs text-muted sm:block">
          <kbd className="rounded border border-white/[0.08] bg-ink/80 px-1.5 py-0.5 font-mono text-[11px] text-slate-300">N</kbd>{' '}
          new quote ·{' '}
          <kbd className="rounded border border-white/[0.08] bg-ink/80 px-1.5 py-0.5 font-mono text-[11px] text-slate-300">Space</kbd>{' '}
          start / pause ·{' '}
          <kbd className="rounded border border-white/[0.08] bg-ink/80 px-1.5 py-0.5 font-mono text-[11px] text-slate-300">R</kbd>{' '}
          reset timer
        </p>
      </div>
    </section>
  );
}
