import { useEffect, useRef, useState } from 'react';
import { THEMES, themeMeta, type Theme } from '../themes';

interface ThemePickerProps {
  theme: Theme;
  onSetTheme: (theme: Theme) => void;
}

/**
 * Palette switcher. Opens a popover of every registered theme with a live
 * swatch trio (canvas / accent / glow). The West African palettes are grouped
 * under their own heading. The trigger shows the active theme's accent colors.
 */
export function ThemePicker({ theme, onSetTheme }: ThemePickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = themeMeta(theme);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent): void => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const house = THEMES.filter((t) => !t.wa);
  const wa = THEMES.filter((t) => t.wa);

  const renderRow = (t: (typeof THEMES)[number]) => {
    const selected = t.key === theme;
    return (
      <button
        key={t.key}
        type="button"
        onClick={() => {
          onSetTheme(t.key);
          setOpen(false);
        }}
        className={`press flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
          selected
            ? 'border-accent/50 bg-accent/10'
            : 'border-transparent hover:border-hairline-strong hover:bg-veil'
        }`}
      >
        <span
          className="flex h-7 w-7 shrink-0 items-center overflow-hidden rounded-full border border-hairline-strong"
          aria-hidden
        >
          <span className="h-full w-1/3" style={{ background: t.swatch[0] }} />
          <span className="h-full w-1/3" style={{ background: t.swatch[1] }} />
          <span className="h-full w-1/3" style={{ background: t.swatch[2] }} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-strong">{t.name}</span>
          <span className="block truncate text-xs text-muted">{t.blurb}</span>
        </span>
        {selected && (
          <svg className="h-4 w-4 shrink-0 text-accent-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </button>
    );
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Change theme · press T to cycle"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Theme: ${active.name}. Change theme`}
        className="press grid h-9 w-9 place-items-center rounded-full border border-hairline hover:border-accent/40"
      >
        <span
          className="h-4 w-4 rounded-full border border-hairline-strong"
          style={{
            background: `conic-gradient(from 140deg, ${active.swatch[1]}, ${active.swatch[2]}, ${active.swatch[1]})`,
          }}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="animate-rise absolute right-0 top-11 z-50 w-64 origin-top-right rounded-2xl border border-hairline-strong bg-panel/95 p-2 shadow-card backdrop-blur-xl"
        >
          <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-[0.16em] text-faint">Editorial</p>
          <div className="flex flex-col gap-0.5">{house.map(renderRow)}</div>
          <div className="mx-3 my-2 border-t border-hairline" />
          <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-faint">West African</p>
          <div className="flex flex-col gap-0.5">{wa.map(renderRow)}</div>
        </div>
      )}
    </div>
  );
}
