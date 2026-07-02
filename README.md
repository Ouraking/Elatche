# Elatche

A minimalist daily focus dashboard: set your one intention, keep your rituals, do the deep work, and watch your consistency compound. All data stays in your browser.

Ships with two full themes — paper-white (default) and deep-ink dark — switchable from the header, the `T` key, or the command palette.

## Stack

Vite · React 19 · TypeScript (strict) · Tailwind CSS 4

## Getting started

```sh
npm install
npm run dev      # dev server at http://localhost:5173
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build
```

## Architecture

App-shell layout with four views — **Today · Focus · Consistency · Fuel** — behind an icon sidebar (bottom tab bar on mobile).

```
src/
├── types.ts                 # Domain types: View, TimerMode, Quote, Habit, DayEntry, AppState
├── data.ts                  # Quotes, default rituals, timer modes, video catalog
├── services/
│   └── storage.ts           # Type-safe localStorage facade + schema guards + v1 migration
├── lib/
│   ├── date.ts              # Day keys, mm:ss formatting
│   ├── stats.ts             # Streaks, all-time records, weekly series
│   ├── audio.ts             # 880Hz completion tone + brown-noise ambient engine (no assets)
│   └── confetti.ts          # Self-removing canvas confetti
├── hooks/
│   ├── useTimer.ts          # App-level Pomodoro engine (survives navigation, auto-queues breaks)
│   ├── useHotkeys.ts        # Global hotkeys that bypass form fields
│   ├── useCountUp.ts        # Animated number transitions
│   └── useToday.ts          # Live YYYY-MM-DD key across midnight
├── components/
│   ├── Sidebar.tsx          # Icon rail (desktop) / tab bar (mobile)
│   ├── Header.tsx           # Pinned intention, mini-timer chip, streak, day-progress hairline
│   ├── CommandPalette.tsx   # ⌘K actions: timer, views, rituals, intention
│   ├── StatsStrip.tsx       # Streak / focus minutes / sessions / rituals
│   ├── IntentionBox.tsx     # The one objective for today (pinned display state)
│   ├── HabitTracker.tsx     # Daily rituals, custom add/remove, progress bar
│   ├── Consistency.tsx      # 12-week activity heatmap
│   ├── FuelVideos.tsx       # Deferred YouTube embeds (thumbnail-first)
│   └── Toast.tsx            # Moment-of-win feedback
├── views/
│   ├── TodayView.tsx        # Serif quote masthead, stats, intention, rituals
│   ├── FocusView.tsx        # Immersive timer: breathing orb, session dots, ambient sound
│   └── ConsistencyView.tsx  # All-time records, weekly bar chart, heatmap
└── App.tsx                  # Shell, view routing, state coordinator
```

## Keyboard

| Key | Action |
| --- | --- |
| `⌘K` / `Ctrl+K` | Command palette |
| `Space` | Start / pause the timer (jumps to Focus) |
| `R` | Reset the timer |
| `N` | Rotate the quote |
| `T` | Toggle light / dark theme |
| `S` | Open settings |
| `1` – `4` | Switch views |

The timer runs at app level — navigate anywhere and a live countdown chip in the header brings you back. Finishing a focus session auto-queues a break (long break every fourth session), or rolls straight into it with auto-start enabled.

## Features

- **Focus Queue** — queue up work on Today; press play on a task to launch a focus session with it pinned to the dial, and mark it done without leaving Focus
- **Settings** (`S`) — custom timer durations, auto-start, desktop notifications, daily focus goal
- **Daily goal** — progress bar on the Focus stat, celebration when you cross it
- **Backup** — export/import all data as JSON from Settings or the palette
