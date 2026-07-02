import { useRef, type PointerEvent } from 'react';
import { HabitTracker } from '../components/HabitTracker';
import { IntentionBox } from '../components/IntentionBox';
import { StatsStrip } from '../components/StatsStrip';
import { TaskList } from '../components/TaskList';
import { QUOTES } from '../data';
import type { DayEntry, Habit, Task } from '../types';

const greetingForHour = (h: number): string =>
  h < 12 ? 'Good morning.' : h < 18 ? 'Good afternoon.' : 'Good evening.';

interface TodayViewProps {
  day: DayEntry;
  habits: Habit[];
  streak: number;
  goalMin: number;
  tasks: Task[];
  focusTaskId: string | undefined;
  quoteIndex: number;
  onNextQuote: () => void;
  onPinIntention: (text: string) => void;
  onClearIntention: () => void;
  onToggleIntentionDone: () => void;
  onToggleHabit: (id: string) => void;
  onAddHabit: (label: string) => void;
  onRemoveHabit: (id: string) => void;
  onAddTask: (label: string) => void;
  onToggleTask: (id: string) => void;
  onRemoveTask: (id: string) => void;
  onFocusTask: (id: string) => void;
}

export function TodayView({
  day,
  habits,
  streak,
  goalMin,
  tasks,
  focusTaskId,
  quoteIndex,
  onNextQuote,
  onPinIntention,
  onClearIntention,
  onToggleIntentionDone,
  onToggleHabit,
  onAddHabit,
  onRemoveHabit,
  onAddTask,
  onToggleTask,
  onRemoveTask,
  onFocusTask,
}: TodayViewProps) {
  const headerRef = useRef<HTMLElement>(null);
  const quote = QUOTES[quoteIndex] ?? QUOTES[0];
  const greeting = greetingForHour(new Date().getHours());

  /* Aurora parallax: normalized pointer position drives --px/--py in CSS. */
  const handlePointerMove = (e: PointerEvent<HTMLElement>): void => {
    const el = headerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--px', ((e.clientX - rect.left) / rect.width - 0.5).toFixed(3));
    el.style.setProperty('--py', ((e.clientY - rect.top) / rect.height - 0.5).toFixed(3));
  };

  return (
    <div className="space-y-10">
      {/* Editorial masthead: cinematic photo + greeting + serif quote */}
      <section ref={headerRef} onPointerMove={handlePointerMove} className="relative isolate overflow-hidden rounded-3xl border border-hairline">
        {/* Cinematic mountain-summit backdrop */}
        <img src="/images/hero-summit.png" alt="" aria-hidden className="hero-photo" />
        <div className="hero-scrim pointer-events-none absolute inset-0" />

        <div className="aurora pointer-events-none absolute inset-0 opacity-70 mix-blend-screen">
          <span className="a1" />
          <span className="a2" />
          <span className="a3" />
        </div>
        <div className="grid-veil pointer-events-none absolute inset-0 opacity-40" />

        <div className="relative animate-rise px-6 pt-16 pb-12 text-center sm:px-10 sm:pt-24 sm:pb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-panel/60 px-3.5 py-1.5 text-xs font-medium text-muted backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-glow" />
            {greeting} One day at a time.
          </span>

          <button type="button" onClick={onNextQuote} title="New quote · press N" className="group block w-full cursor-pointer">
            <div key={quoteIndex}>
              <blockquote className="mx-auto mt-6 max-w-2xl animate-fade-swap font-quote text-3xl italic leading-[1.15] tracking-tight text-strong transition-colors group-hover:text-accent-soft sm:text-[2.75rem]">
                “{quote?.text}”
              </blockquote>
              <p className="mt-4 animate-fade-swap text-sm font-medium tracking-wide text-accent-soft">
                — {quote?.author}
              </p>
            </div>
          </button>
        </div>
      </section>

      <StatsStrip
        streak={streak}
        focusMin={day.focusMin}
        sessions={day.sessions}
        habitsDone={day.habitsDone.length}
        habitsTotal={habits.length}
        goalMin={goalMin}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <IntentionBox
          intention={day.intention}
          intentionDone={day.intentionDone ?? false}
          onPin={onPinIntention}
          onClear={onClearIntention}
          onToggleDone={onToggleIntentionDone}
        />
        <HabitTracker
          habits={habits}
          doneIds={day.habitsDone}
          onToggle={onToggleHabit}
          onAdd={onAddHabit}
          onRemove={onRemoveHabit}
        />
        <TaskList
          tasks={tasks}
          focusTaskId={focusTaskId}
          onAdd={onAddTask}
          onToggle={onToggleTask}
          onRemove={onRemoveTask}
          onFocusTask={onFocusTask}
        />
      </div>
    </div>
  );
}
