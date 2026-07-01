# Elatche

A minimalist daily focus dashboard: set your one intention, keep your rituals, do the deep work, and watch your consistency compound. All data stays in your browser.

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

```
src/
├── types.ts                 # Domain types: TimerMode, Quote, Habit, DayEntry, AppState
├── data.ts                  # Quotes, default rituals, timer modes, video catalog
├── services/
│   └── storage.ts           # Type-safe localStorage facade + schema guards + v1 migration
├── lib/
│   ├── date.ts              # Day keys, mm:ss formatting
│   ├── stats.ts             # Day scores, streak computation
│   ├── audio.ts             # 880Hz Web Audio completion tone (no assets)
│   └── confetti.ts          # Self-removing canvas confetti
├── hooks/
│   ├── useHotkeys.ts        # Global hotkeys that bypass form fields
│   └── useToday.ts          # Live YYYY-MM-DD key across midnight
├── components/
│   ├── Header.tsx           # Pinned intention, streak badge, clock
│   ├── Hero.tsx             # Greeting, rotating quote, aurora backdrop
│   ├── StatsStrip.tsx       # Streak / focus minutes / sessions / rituals
│   ├── IntentionBox.tsx     # The one objective for today
│   ├── HabitTracker.tsx     # Daily rituals, custom add/remove
│   ├── FocusTimer.tsx       # Pomodoro with SVG progress ring
│   ├── Consistency.tsx      # 12-week activity heatmap
│   ├── FuelVideos.tsx       # Deferred YouTube embeds (thumbnail-first)
│   └── Collapse.tsx         # Zen-mode section collapse
└── App.tsx                  # State coordinator, layout, atmosphere
```

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `Space` | Start / pause the focus timer |
| `R` | Reset the timer |
| `N` | Rotate the hero quote |

Starting the timer enters **Zen mode** — everything except the timer and your pinned intention collapses away until you pause.
