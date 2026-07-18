import { useRef } from 'react';
import { notificationsSupported } from '../lib/notify';
import type { Settings } from '../types';

interface SettingsPanelProps {
  open: boolean;
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onToggleNotify: () => void;
  onExport: () => void;
  onImport: (json: string) => void;
  onReplayWelcome: () => void;
  onClose: () => void;
}

interface DurationFieldProps {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
}

function DurationField({ label, value, max, onChange }: DurationFieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={max}
          value={value}
          onChange={(e) => {
            const n = Math.round(Number(e.target.value));
            if (Number.isFinite(n)) onChange(Math.min(max, Math.max(1, n)));
          }}
          className="w-full rounded-xl border border-hairline bg-ink/60 px-3 py-2 font-mono text-sm text-fg focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/25"
        />
        <span className="text-xs text-muted">min</span>
      </div>
    </label>
  );
}

interface ToggleRowProps {
  label: string;
  hint: string;
  on: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

function ToggleRow({ label, hint, on, onToggle, disabled = false }: ToggleRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onToggle}
      className="press flex w-full items-center justify-between gap-4 rounded-xl border border-hairline bg-ink/40 px-4 py-3 text-left disabled:opacity-50"
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-strong">{label}</span>
        <span className="block text-xs text-muted">{hint}</span>
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${
          on ? 'bg-accent' : 'bg-edge'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[left] duration-300 ease-(--ease-spring) ${
            on ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  );
}

export function SettingsPanel({ open, settings, onChange, onToggleNotify, onExport, onImport, onReplayWelcome, onClose }: SettingsPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/60 px-4 py-[10vh] backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div
        className="animate-toast-in w-full max-w-md rounded-2xl border border-hairline-strong bg-panel/95 p-6 shadow-[0_40px_80px_-20px_rgba(0,0,0,.5)] backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-strong">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="press rounded-lg px-2 py-1 text-sm text-muted hover:text-strong"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">Timer</p>
        <div className="grid grid-cols-3 gap-3">
          <DurationField label="Focus" value={settings.focusMin} max={180} onChange={(v) => onChange({ focusMin: v })} />
          <DurationField label="Break" value={settings.shortMin} max={60} onChange={(v) => onChange({ shortMin: v })} />
          <DurationField label="Long" value={settings.longMin} max={90} onChange={(v) => onChange({ longMin: v })} />
        </div>

        <div className="mt-4 space-y-2.5">
          <ToggleRow
            label="Auto-start next session"
            hint="Roll straight from focus into break, and back."
            on={settings.autoStart}
            onToggle={() => onChange({ autoStart: !settings.autoStart })}
          />
          <ToggleRow
            label="Desktop notifications"
            hint={notificationsSupported() ? 'Get notified when a session ends.' : 'Not supported in this browser.'}
            on={settings.notify}
            onToggle={onToggleNotify}
            disabled={!notificationsSupported()}
          />
        </div>

        <p className="mt-6 mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">Daily goal</p>
        <label className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            max={1440}
            step={15}
            value={settings.dailyGoalMin}
            onChange={(e) => {
              const n = Math.round(Number(e.target.value));
              if (Number.isFinite(n)) onChange({ dailyGoalMin: Math.min(1440, Math.max(0, n)) });
            }}
            className="w-28 rounded-xl border border-hairline bg-ink/60 px-3 py-2 font-mono text-sm text-fg focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/25"
          />
          <span className="text-xs text-muted">focus minutes per day · 0 turns the goal off</span>
        </label>

        <p className="mt-6 mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">Your data</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onExport}
            className="press flex-1 rounded-xl border border-hairline-strong px-4 py-2.5 text-sm font-semibold text-fg hover:border-accent/50 hover:text-strong"
          >
            Export backup
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="press flex-1 rounded-xl border border-hairline-strong px-4 py-2.5 text-sm font-semibold text-fg hover:border-accent/50 hover:text-strong"
          >
            Import backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              void file.text().then(onImport);
              e.target.value = '';
            }}
          />
        </div>
        <p className="mt-3 text-xs text-muted">
          Everything lives in this browser. Export before switching machines.
        </p>

        <div className="mt-6 border-t border-hairline pt-4">
          <button
            type="button"
            onClick={onReplayWelcome}
            className="press flex w-full items-center justify-center gap-2 rounded-xl border border-hairline px-4 py-2.5 text-sm font-medium text-muted hover:border-accent/40 hover:text-strong"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />
            </svg>
            Replay the welcome tour
          </button>
        </div>
      </div>
    </div>
  );
}
