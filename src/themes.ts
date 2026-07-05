/**
 * Theme registry. Each theme maps to a `data-theme` value on <html> and a set
 * of `--t-*` CSS variables defined in index.css. `mode` drives blend-mode /
 * luminance-dependent treatments (light themes get the `.light` class).
 *
 * Three of the palettes draw on West African textile traditions:
 *  - Sahel  — sun-baked clay, terracotta and millet gold of the Sahel at dusk
 *  - Kente  — the gold and forest green of Ashanti kente cloth on black
 *  - Indigo — Yoruba adire / Tuareg indigo dye, warmed with amber gold
 */
export type Theme = 'paper' | 'ink' | 'sahel' | 'kente' | 'indigo';

export interface ThemeMeta {
  key: Theme;
  /** Display name in the picker. */
  name: string;
  /** One-line flavor text. */
  blurb: string;
  /** Luminance mode — light themes toggle the `.light` class. */
  mode: 'light' | 'dark';
  /** Swatch preview: [canvas, accent, glow]. */
  swatch: [string, string, string];
  /** True for the West African palettes (grouped in the picker). */
  wa?: boolean;
}

export const THEMES: ThemeMeta[] = [
  {
    key: 'ink',
    name: 'Ink',
    blurb: 'Steel-navy nightfall',
    mode: 'dark',
    swatch: ['#090d13', '#4181b8', '#2dd4bf'],
  },
  {
    key: 'paper',
    name: 'Paper',
    blurb: 'Editorial daylight',
    mode: 'light',
    swatch: ['#f7f6f2', '#17406b', '#0f9d8f'],
  },
  {
    key: 'sahel',
    name: 'Sahel',
    blurb: 'Clay & millet gold',
    mode: 'dark',
    swatch: ['#17100b', '#c2632a', '#f2b134'],
    wa: true,
  },
  {
    key: 'kente',
    name: 'Kente',
    blurb: 'Ashanti gold & green',
    mode: 'dark',
    swatch: ['#0c0f0c', '#d4a017', '#1f9d55'],
    wa: true,
  },
  {
    key: 'indigo',
    name: 'Indigo',
    blurb: 'Adire dye & amber',
    mode: 'dark',
    swatch: ['#0b1020', '#4964d6', '#e0a83e'],
    wa: true,
  },
];

const THEME_KEYS = new Set<string>(THEMES.map((t) => t.key));

export const isTheme = (v: unknown): v is Theme => typeof v === 'string' && THEME_KEYS.has(v);

/** Migrate legacy binary values ('light' | 'dark') to the new theme keys. */
export function coerceTheme(v: unknown): Theme {
  if (v === 'light') return 'paper';
  if (v === 'dark') return 'ink';
  return isTheme(v) ? v : 'ink';
}

const FALLBACK_THEME = THEMES[0] as ThemeMeta;

export const themeMeta = (key: Theme): ThemeMeta =>
  THEMES.find((t) => t.key === key) ?? FALLBACK_THEME;
