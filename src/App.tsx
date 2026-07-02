import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CommandPalette, type Command } from './components/CommandPalette';
import { FuelVideos } from './components/FuelVideos';
import { Header } from './components/Header';
import { SettingsPanel } from './components/SettingsPanel';
import { Sidebar } from './components/Sidebar';
import { Toasts, type ToastItem } from './components/Toast';
import { durationsFrom, QUOTES } from './data';
import { useHotkeys } from './hooks/useHotkeys';
import { useTimer } from './hooks/useTimer';
import { useToday } from './hooks/useToday';
import { toggleAmbient } from './lib/audio';
import { fireConfetti } from './lib/confetti';
import { requestNotificationPermission } from './lib/notify';
import { computeStreak } from './lib/stats';
import {
  emptyDay,
  exportBackup,
  loadAppState,
  loadSettings,
  loadTheme,
  parseBackup,
  saveAppState,
  saveSettings,
  saveTheme,
  type Theme,
} from './services/storage';
import { ConsistencyView } from './views/ConsistencyView';
import { FocusView } from './views/FocusView';
import { TodayView } from './views/TodayView';
import { dateKey } from './lib/date';
import type { AppState, DayEntry, Settings, View } from './types';

/** Film-grain texture: an inline SVG turbulence tile, no asset request. */
const NOISE_TILE =
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const QUOTE_ROTATE_MS = 15_000;

const randomQuoteIndex = (exclude: number): number => {
  if (QUOTES.length < 2) return 0;
  let i = exclude;
  while (i === exclude) i = Math.floor(Math.random() * QUOTES.length);
  return i;
};

export default function App() {
  const [state, setState] = useState<AppState>(loadAppState);
  const [view, setView] = useState<View>('today');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [ambientOn, setAmbientOn] = useState(false);
  const [theme, setTheme] = useState<Theme>(loadTheme);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastId = useRef(0);
  const today = useToday();

  useEffect(() => {
    saveAppState(state);
  }, [state]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    saveTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(
    (): void => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
    [],
  );

  const pushToast = useCallback((text: string): void => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  /* Cursor spotlight: feed pointer position into the hovered card's CSS vars. */
  useEffect(() => {
    const onPointerMove = (e: PointerEvent): void => {
      const target = e.target instanceof Element ? e.target.closest('.card') : null;
      if (target instanceof HTMLElement) {
        const rect = target.getBoundingClientRect();
        target.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
        target.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
      }
    };
    document.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => document.removeEventListener('pointermove', onPointerMove);
  }, []);

  const day: DayEntry = state.days[today] ?? emptyDay();
  const streak = useMemo(() => computeStreak(state.days), [state.days]);

  const updateToday = useCallback(
    (update: (entry: DayEntry) => DayEntry): void => {
      setState((s) => ({ ...s, days: { ...s.days, [today]: update(s.days[today] ?? emptyDay()) } }));
    },
    [today],
  );

  /* ----- Timer (app-level: survives navigation) ----- */
  const handleSessionComplete = useCallback(
    (minutes: number): void => {
      updateToday((d) => ({ ...d, sessions: d.sessions + 1, focusMin: d.focusMin + minutes }));
      fireConfetti();
      pushToast(`+${minutes}m deep work logged. Break queued — breathe.`);
    },
    [updateToday, pushToast],
  );

  const durations = useMemo(() => durationsFrom(settings), [settings]);

  const timer = useTimer({
    durations,
    sessionsToday: day.sessions,
    autoStart: settings.autoStart,
    notify: settings.notify,
    onSessionComplete: handleSessionComplete,
  });

  const startAndEnterFocus = useCallback((): void => {
    timer.start();
    setView('focus');
  }, [timer]);

  /* Celebrate crossing the daily focus goal, once per crossing. */
  const goalReached = settings.dailyGoalMin > 0 && day.focusMin >= settings.dailyGoalMin;
  const prevGoalReached = useRef(goalReached);
  useEffect(() => {
    if (goalReached && !prevGoalReached.current) {
      fireConfetti();
      pushToast(`Daily goal hit: ${settings.dailyGoalMin} minutes of deep work.`);
    }
    prevGoalReached.current = goalReached;
  }, [goalReached, settings.dailyGoalMin, pushToast]);

  /* ----- Intention ----- */
  const pinIntention = (text: string): void => updateToday((d) => ({ ...d, intention: text }));

  const clearIntention = (): void =>
    updateToday(({ intention: _text, intentionDone: _done, ...rest }) => rest);

  const toggleIntentionDone = useCallback((): void => {
    const willBeDone = !day.intentionDone;
    updateToday((d) => ({ ...d, intentionDone: willBeDone }));
    if (willBeDone) {
      fireConfetti();
      pushToast("Intention fulfilled. That's the day won.");
    }
  }, [day.intentionDone, updateToday, pushToast]);

  /* ----- Rituals ----- */
  const toggleHabit = useCallback(
    (id: string): void => {
      // Pure updater: rapid successive toggles must not read a stale snapshot.
      updateToday((d) => ({
        ...d,
        habitsDone: d.habitsDone.includes(id)
          ? d.habitsDone.filter((h) => h !== id)
          : [...d.habitsDone, id],
      }));
    },
    [updateToday],
  );

  /* Celebrate exactly once when the last ritual flips done. */
  const allRitualsDone = state.habits.length > 0 && day.habitsDone.length === state.habits.length;
  const prevAllDone = useRef(allRitualsDone);
  useEffect(() => {
    if (allRitualsDone && !prevAllDone.current) {
      fireConfetti();
      pushToast('All rituals complete. Untouchable today.');
    }
    prevAllDone.current = allRitualsDone;
  }, [allRitualsDone, pushToast]);

  const addHabit = (label: string): void => {
    const id = `c${Date.now().toString(36)}`;
    setState((s) => ({ ...s, habits: [...s.habits, { id, label }] }));
  };

  const removeHabit = (id: string): void => {
    setState((s) => ({ ...s, habits: s.habits.filter((h) => h.id !== id) }));
    updateToday((d) => ({ ...d, habitsDone: d.habitsDone.filter((h) => h !== id) }));
  };

  /* ----- Focus Queue ----- */
  const focusTask = state.focusTaskId
    ? state.tasks.find((t) => t.id === state.focusTaskId && !t.done)
    : undefined;

  const addTask = (label: string): void => {
    const id = `t${Date.now().toString(36)}`;
    setState((s) => ({ ...s, tasks: [...s.tasks, { id, label, done: false }] }));
  };

  const toggleTask = useCallback((id: string): void => {
    setState((s) => {
      const task = s.tasks.find((t) => t.id === id);
      const next: AppState = {
        ...s,
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
      };
      // Completing the targeted task releases the focus target
      if (task && !task.done && s.focusTaskId === id) delete next.focusTaskId;
      return next;
    });
  }, []);

  const completeFocusTask = useCallback(
    (id: string): void => {
      toggleTask(id);
      pushToast('Task shipped. Pick the next one.');
    },
    [toggleTask, pushToast],
  );

  const removeTask = (id: string): void => {
    setState((s) => {
      const next: AppState = { ...s, tasks: s.tasks.filter((t) => t.id !== id) };
      if (s.focusTaskId === id) delete next.focusTaskId;
      return next;
    });
  };

  const focusOnTask = useCallback(
    (id: string): void => {
      setState((s) => ({ ...s, focusTaskId: id }));
      // Keep an in-flight focus session; otherwise start a fresh one
      if (!(timer.running && timer.mode === 'focus')) timer.startFocusSession();
      setView('focus');
    },
    [timer],
  );

  /* ----- Settings, backup, notifications ----- */
  const patchSettings = useCallback(
    (patch: Partial<Settings>): void => setSettings((s) => ({ ...s, ...patch })),
    [],
  );

  const handleToggleNotify = useCallback((): void => {
    if (settings.notify) {
      patchSettings({ notify: false });
      return;
    }
    void requestNotificationPermission().then((granted) => {
      if (granted) patchSettings({ notify: true });
      else pushToast("Notifications are blocked. Allow them in your browser's site settings.");
    });
  }, [settings.notify, patchSettings, pushToast]);

  const handleExport = useCallback((): void => {
    const blob = new Blob([exportBackup(state, settings, theme)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elatche-backup-${dateKey(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
    pushToast('Backup downloaded.');
  }, [state, settings, theme, pushToast]);

  const handleImport = useCallback(
    (json: string): void => {
      const backup = parseBackup(json);
      if (!backup) {
        pushToast("That's not an Elatche backup. Choose a JSON file exported from Settings.");
        return;
      }
      setState(backup.state);
      setSettings(backup.settings);
      setTheme(backup.theme);
      setSettingsOpen(false);
      pushToast('Backup restored.');
    },
    [pushToast],
  );

  /* ----- Ambience & quotes ----- */
  const handleToggleAmbient = useCallback((): void => setAmbientOn(toggleAmbient()), []);

  const nextQuote = useCallback((): void => setQuoteIndex((i) => randomQuoteIndex(i)), []);

  useEffect(() => {
    if (view !== 'today') return;
    const id = setInterval(nextQuote, QUOTE_ROTATE_MS);
    return () => clearInterval(id);
  }, [view, quoteIndex, nextQuote]);

  /* ----- Power-user keyboard layer ----- */
  useHotkeys({
    space: () => (timer.running ? timer.pause() : startAndEnterFocus()),
    r: timer.reset,
    n: nextQuote,
    t: toggleTheme,
    s: () => setSettingsOpen(true),
    '1': () => setView('today'),
    '2': () => setView('focus'),
    '3': () => setView('consistency'),
    '4': () => setView('fuel'),
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  /* ----- Command palette ----- */
  const commands = useMemo<Command[]>(() => {
    const list: Command[] = [
      {
        id: 'timer-toggle',
        label: timer.running ? 'Pause the timer' : 'Start the timer',
        hint: 'Space',
        run: () => (timer.running ? timer.pause() : startAndEnterFocus()),
      },
      { id: 'timer-reset', label: 'Reset the timer', hint: 'R', run: timer.reset },
      { id: 'go-today', label: 'Go to Today', hint: '1', run: () => setView('today') },
      { id: 'go-focus', label: 'Go to Focus', hint: '2', run: () => setView('focus') },
      { id: 'go-consistency', label: 'Go to Consistency', hint: '3', run: () => setView('consistency') },
      { id: 'go-fuel', label: 'Go to Fuel', hint: '4', run: () => setView('fuel') },
      {
        id: 'ambient',
        label: ambientOn ? 'Turn ambient sound off' : 'Turn ambient sound on',
        run: handleToggleAmbient,
      },
      { id: 'quote', label: 'New quote', hint: 'N', run: nextQuote },
      {
        id: 'theme',
        label: theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme',
        hint: 'T',
        run: toggleTheme,
      },
      { id: 'settings', label: 'Open settings', hint: 'S', run: () => setSettingsOpen(true) },
      { id: 'export', label: 'Export backup', run: handleExport },
    ];
    for (const task of state.tasks.filter((t) => !t.done)) {
      list.push({
        id: `task-${task.id}`,
        label: `Focus on: ${task.label}`,
        run: () => focusOnTask(task.id),
      });
    }
    if (day.intention) {
      list.push({
        id: 'intention-done',
        label: day.intentionDone ? 'Reopen the intention' : 'Mark the intention done',
        run: toggleIntentionDone,
      });
    }
    for (const habit of state.habits) {
      list.push({
        id: `habit-${habit.id}`,
        label: `${day.habitsDone.includes(habit.id) ? 'Undo' : 'Complete'} ritual: ${habit.label}`,
        run: () => toggleHabit(habit.id),
      });
    }
    return list;
  }, [
    timer,
    startAndEnterFocus,
    ambientOn,
    handleToggleAmbient,
    nextQuote,
    theme,
    toggleTheme,
    day.intention,
    day.intentionDone,
    day.habitsDone,
    state.habits,
    state.tasks,
    toggleIntentionDone,
    toggleHabit,
    handleExport,
    focusOnTask,
  ]);

  return (
    <div id="top" className="min-h-screen font-sans text-fg antialiased selection:bg-accent/30 selection:text-strong">
      {/* Atmospheric noise overlay */}
      <div
        aria-hidden
        className="noise pointer-events-none fixed inset-0 z-40"
        style={{ backgroundImage: NOISE_TILE }}
      />

      <Sidebar
        view={view}
        onNavigate={setView}
        onOpenPalette={() => setPaletteOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className="pb-20 md:pb-0 md:pl-16">
        <Header
          intention={day.intention}
          intentionDone={day.intentionDone ?? false}
          streak={streak}
          timerRunning={timer.running}
          timerRemaining={timer.remaining}
          showMiniTimer={view !== 'focus'}
          onMiniTimerClick={() => setView('focus')}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          <div key={view} className="animate-view">
            {view === 'today' && (
              <TodayView
                day={day}
                habits={state.habits}
                streak={streak}
                goalMin={settings.dailyGoalMin}
                tasks={state.tasks}
                focusTaskId={state.focusTaskId}
                quoteIndex={quoteIndex}
                onNextQuote={nextQuote}
                onPinIntention={pinIntention}
                onClearIntention={clearIntention}
                onToggleIntentionDone={toggleIntentionDone}
                onToggleHabit={toggleHabit}
                onAddHabit={addHabit}
                onRemoveHabit={removeHabit}
                onAddTask={addTask}
                onToggleTask={toggleTask}
                onRemoveTask={removeTask}
                onFocusTask={focusOnTask}
              />
            )}
            {view === 'focus' && (
              <FocusView
                timer={timer}
                durations={durations}
                intention={day.intention}
                focusTask={focusTask}
                onCompleteTask={completeFocusTask}
                sessionsToday={day.sessions}
                ambientOn={ambientOn}
                onToggleAmbient={handleToggleAmbient}
              />
            )}
            {view === 'consistency' && <ConsistencyView days={state.days} />}
            {view === 'fuel' && <FuelVideos />}
          </div>

          <footer className="mt-16 border-t border-hairline pt-6 pb-4 text-center">
            <p className="text-xs text-muted">
              Elatche · Built for the ones who show up daily. Your data stays in this browser.
            </p>
          </footer>
        </main>
      </div>

      <CommandPalette open={paletteOpen} commands={commands} onClose={() => setPaletteOpen(false)} />
      <SettingsPanel
        open={settingsOpen}
        settings={settings}
        onChange={patchSettings}
        onToggleNotify={handleToggleNotify}
        onExport={handleExport}
        onImport={handleImport}
        onClose={() => setSettingsOpen(false)}
      />
      <Toasts items={toasts} />
    </div>
  );
}
