import type { ReactNode } from 'react';
import type { View } from '../types';

interface NavItem {
  view: View;
  label: string;
  icon: ReactNode;
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const NAV: NavItem[] = [
  {
    view: 'today',
    label: 'Today',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" {...stroke}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    ),
  },
  {
    view: 'focus',
    label: 'Focus',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" {...stroke}>
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2 2M9 2h6" />
      </svg>
    ),
  },
  {
    view: 'consistency',
    label: 'Streaks',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" {...stroke}>
        <path d="M3 3v18h18" />
        <path d="M7 15l4-4 3 3 5-6" />
      </svg>
    ),
  },
  {
    view: 'fuel',
    label: 'Fuel',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" {...stroke}>
        <path d="m22 8-6 4 6 4V8z" />
        <rect x="2" y="6" width="14" height="12" rx="2" />
      </svg>
    ),
  },
];

interface SidebarProps {
  view: View;
  onNavigate: (view: View) => void;
  onOpenPalette: () => void;
  onOpenSettings: () => void;
}

export function Sidebar({ view, onNavigate, onOpenPalette, onOpenSettings }: SidebarProps) {
  return (
    <>
      {/* Desktop: left rail */}
      <nav className="fixed inset-y-0 left-0 z-40 hidden w-16 flex-col items-center border-r border-hairline bg-ink/70 py-4 backdrop-blur-xl md:flex">
        <a href="#top" className="mb-6 grid h-9 w-9 place-items-center rounded-xl bg-accent/15 ring-1 ring-accent/40" title="Elatche">
          <span className="h-2.5 w-2.5 rounded-sm bg-accent shadow-[0_0_12px_2px_color-mix(in_oklab,var(--t-accent)_70%,transparent)]" />
        </a>

        <div className="flex flex-1 flex-col gap-1.5">
          {NAV.map((item, i) => {
            const active = view === item.view;
            return (
              <button
                key={item.view}
                type="button"
                onClick={() => onNavigate(item.view)}
                aria-current={active ? 'page' : undefined}
                title={`${item.label} · press ${i + 1}`}
                className={`press group relative grid h-11 w-11 place-items-center rounded-xl transition-colors ${
                  active
                    ? 'bg-accent/15 text-accent-soft ring-1 ring-accent/40'
                    : 'text-muted hover:bg-veil hover:text-fg'
                }`}
              >
                {item.icon}
                <span className="pointer-events-none absolute left-full ml-2 hidden whitespace-nowrap rounded-md border border-hairline-strong bg-panel/95 px-2 py-1 text-xs font-medium text-fg shadow-lg group-hover:block">
                  {item.label}
                </span>
                {active && (
                  <span className="absolute -left-[13px] h-5 w-[3px] rounded-full bg-accent shadow-[0_0_8px_color-mix(in_oklab,var(--t-accent)_70%,transparent)]" />
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          title="Settings · press S"
          className="press mb-1.5 grid h-11 w-11 place-items-center rounded-xl text-muted hover:bg-veil hover:text-fg"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" {...stroke}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onOpenPalette}
          title="Command palette · ⌘K"
          className="press grid h-11 w-11 place-items-center rounded-xl text-muted hover:bg-veil hover:text-fg"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" {...stroke}>
            <path d="M4 17l6-5-6-5M12 19h8" />
          </svg>
        </button>
      </nav>

      {/* Mobile: bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-hairline bg-ink/85 py-2 backdrop-blur-xl md:hidden">
        {NAV.map((item) => {
          const active = view === item.view;
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => onNavigate(item.view)}
              aria-current={active ? 'page' : undefined}
              className={`press flex flex-col items-center gap-0.5 rounded-lg px-4 py-1 ${
                active ? 'text-accent-soft' : 'text-muted'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
