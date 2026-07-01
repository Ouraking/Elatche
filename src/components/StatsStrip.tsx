interface StatsStripProps {
  streak: number;
  focusMin: number;
  sessions: number;
  habitsDone: number;
  habitsTotal: number;
}

interface StatCardProps {
  value: string;
  suffix?: string;
  label: string;
}

function StatCard({ value, suffix, label }: StatCardProps) {
  return (
    <div className="card px-4 py-4">
      <p className="font-mono text-2xl font-bold text-white">
        {value}
        {suffix && <span className="text-sm text-muted">{suffix}</span>}
      </p>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{label}</p>
    </div>
  );
}

export function StatsStrip({ streak, focusMin, sessions, habitsDone, habitsTotal }: StatsStripProps) {
  return (
    <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard value={String(streak)} label="Day streak" />
      <StatCard value={String(Math.round(focusMin))} suffix="m" label="Focus today" />
      <StatCard value={String(sessions)} label="Sessions" />
      <StatCard value={`${habitsDone}/${habitsTotal}`} label="Rituals done" />
    </div>
  );
}
