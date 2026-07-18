import { useRef, type CSSProperties, type PointerEvent } from 'react';
import { HabitTracker } from '../components/HabitTracker';
import { IntentionBox } from '../components/IntentionBox';
import { StatsStrip } from '../components/StatsStrip';
import { TaskList } from '../components/TaskList';
import { QUOTES } from '../data';
import type { DayEntry, Habit, Task } from '../types';

const greetingForHour = (h: number): string =>
  h < 12 ? 'Good morning.' : h < 18 ? 'Good afternoon.' : 'Good evening.';

const fullDate = (): string =>
  new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

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
      {/* Editorial masthead: greeting + serif reflection */}
      <section
        ref={headerRef}
        onPointerMove={handlePointerMove}
        className="relative isolate overflow-hidden rounded-3xl border border-hairline"
      >
        <div className="aurora pointer-events-none absolute inset-0">
          <span className="a1" />
          <span className="a2" />
          <span className="a3" />
        </div>
        <div className="grid-veil pointer-events-none absolute inset-0" />

        <div className="relative animate-rise px-6 pt-14 pb-12 text-center sm:px-10 sm:pt-20 sm:pb-16">
          <div className="flex flex-col items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-panel/60 px-3.5 py-1.5 text-xs font-medium text-muted backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-glow" />
              {greeting}{' '}
              <span className="text-fg">{streak > 0 ? `Day ${streak} of showing up.` : 'One day at a time.'}</span>
            </span>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-faint">{fullDate()}</p>
          </div>

          <button type="button" onClick={onNextQuote} title="New reflection · press N" className="group mt-8 block w-full cursor-pointer">
            <div key={quoteIndex}>
              <blockquote className="mx-auto max-w-3xl animate-fade-swap font-quote text-[2rem] italic leading-[1.12] tracking-tight text-strong transition-colors group-hover:text-accent-soft sm:text-5xl">
                <span className="text-accent/40">“</span>
                {quote?.text}
                <span className="text-accent/40">”</span>
              </blockquote>
              <p className="mt-5 animate-fade-swap text-sm font-medium tracking-wide text-accent-soft">
                — {quote?.author}
              </p>
            </div>

            <span className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-hairline bg-panel/40 px-3 py-1 text-[11px] font-medium text-muted opacity-70 transition-opacity group-hover:opacity-100">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />
              </svg>
              New reflection
              <kbd className="ml-0.5 rounded border border-hairline-strong bg-ink/70 px-1 font-mono text-[10px] text-fg">N</kbd>
            </span>
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
        <div className="reveal" style={{ '--i': 0 } as CSSProperties}>
          <IntentionBox
            intention={day.intention}
            intentionDone={day.intentionDone ?? false}
            onPin={onPinIntention}
            onClear={onClearIntention}
            onToggleDone={onToggleIntentionDone}
          />
        </div>
        <div className="reveal" style={{ '--i': 1 } as CSSProperties}>
          <HabitTracker
            habits={habits}
            doneIds={day.habitsDone}
            onToggle={onToggleHabit}
            onAdd={onAddHabit}
            onRemove={onRemoveHabit}
          />
        </div>
        <div className="reveal lg:col-span-2" style={{ '--i': 2 } as CSSProperties}>
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
    </div>
  );
}
