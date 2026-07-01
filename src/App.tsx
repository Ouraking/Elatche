import { useCallback, useEffect, useMemo, useState } from 'react';
import { Collapse } from './components/Collapse';
import { Consistency } from './components/Consistency';
import { FocusTimer } from './components/FocusTimer';
import { FuelVideos } from './components/FuelVideos';
import { HabitTracker } from './components/HabitTracker';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { IntentionBox } from './components/IntentionBox';
import { useToday } from './hooks/useToday';
import { fireConfetti } from './lib/confetti';
import { computeStreak } from './lib/stats';
import { emptyDay, loadAppState, saveAppState } from './services/storage';
import { StatsStrip } from './components/StatsStrip';
import type { AppState, DayEntry } from './types';

/** Film-grain texture: an inline SVG turbulence tile, no asset request. */
const NOISE_TILE =
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export default function App() {
  const [state, setState] = useState<AppState>(loadAppState);
  const [zen, setZen] = useState(false);
  const today = useToday();

  useEffect(() => {
    saveAppState(state);
  }, [state]);

  const day: DayEntry = state.days[today] ?? emptyDay();
  const streak = useMemo(() => computeStreak(state.days), [state.days]);

  const updateToday = useCallback(
    (update: (entry: DayEntry) => DayEntry): void => {
      setState((s) => ({ ...s, days: { ...s.days, [today]: update(s.days[today] ?? emptyDay()) } }));
    },
    [today],
  );

  /* ----- Intention ----- */
  const pinIntention = (text: string): void => updateToday((d) => ({ ...d, intention: text }));

  const clearIntention = (): void =>
    updateToday(({ intention: _text, intentionDone: _done, ...rest }) => rest);

  const toggleIntentionDone = (): void => {
    const willBeDone = !day.intentionDone;
    updateToday((d) => ({ ...d, intentionDone: willBeDone }));
    if (willBeDone) fireConfetti();
  };

  /* ----- Rituals ----- */
  const toggleHabit = (id: string): void => {
    const wasDone = day.habitsDone.includes(id);
    const habitsDone = wasDone ? day.habitsDone.filter((h) => h !== id) : [...day.habitsDone, id];
    updateToday((d) => ({ ...d, habitsDone }));
    if (!wasDone && habitsDone.length === state.habits.length) fireConfetti();
  };

  const addHabit = (label: string): void => {
    const id = `c${Date.now().toString(36)}`;
    setState((s) => ({ ...s, habits: [...s.habits, { id, label }] }));
  };

  const removeHabit = (id: string): void => {
    setState((s) => ({ ...s, habits: s.habits.filter((h) => h.id !== id) }));
    updateToday((d) => ({ ...d, habitsDone: d.habitsDone.filter((h) => h !== id) }));
  };

  /* ----- Timer ----- */
  const handleSessionComplete = useCallback(
    (minutes: number): void => {
      updateToday((d) => ({ ...d, sessions: d.sessions + 1, focusMin: d.focusMin + minutes }));
      fireConfetti();
    },
    [updateToday],
  );

  const handleRunningChange = useCallback((running: boolean): void => setZen(running), []);

  return (
    <div id="top" className="min-h-screen font-sans text-slate-200 antialiased selection:bg-accent/30 selection:text-white">
      {/* Atmospheric noise overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-40 opacity-[0.04] mix-blend-overlay"
        style={{ backgroundImage: NOISE_TILE }}
      />

      <Header intention={day.intention} intentionDone={day.intentionDone ?? false} streak={streak} />

      <main className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        <Collapse hidden={zen}>
          <Hero />
          <div className="pb-14">
            <StatsStrip
              streak={streak}
              focusMin={day.focusMin}
              sessions={day.sessions}
              habitsDone={day.habitsDone.length}
              habitsTotal={state.habits.length}
            />
          </div>
        </Collapse>

        <section id="dashboard">
          <Collapse hidden={zen}>
            <div className="grid grid-cols-1 gap-6 pb-6 md:grid-cols-2">
              <IntentionBox
                intention={day.intention}
                intentionDone={day.intentionDone ?? false}
                onPin={pinIntention}
                onClear={clearIntention}
                onToggleDone={toggleIntentionDone}
              />
              <HabitTracker
                habits={state.habits}
                doneIds={day.habitsDone}
                onToggle={toggleHabit}
                onAdd={addHabit}
                onRemove={removeHabit}
              />
            </div>
          </Collapse>

          <div className={`transition-[padding] duration-700 ease-(--ease-spring) ${zen ? 'pt-10' : ''}`}>
            <FocusTimer
              sessionsToday={day.sessions}
              zen={zen}
              intention={day.intention}
              onSessionComplete={handleSessionComplete}
              onRunningChange={handleRunningChange}
            />
          </div>
        </section>

        <Collapse hidden={zen}>
          <div className="mt-16 space-y-16">
            <Consistency days={state.days} />
            <FuelVideos />
          </div>
        </Collapse>

        <footer className="mt-16 border-t border-white/[0.06] pt-6 text-center">
          <p className="text-xs text-muted">
            Elatche · Built for the ones who show up daily. Your data stays in this browser.
          </p>
        </footer>
      </main>
    </div>
  );
}
