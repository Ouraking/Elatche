export interface ToastItem {
  id: number;
  text: string;
}

interface ToastsProps {
  items: ToastItem[];
}

/** Bottom-center toast stack for moment-of-win feedback. */
export function Toasts({ items }: ToastsProps) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2"
    >
      {items.map((toast) => (
        <div
          key={toast.id}
          className="animate-toast-in flex items-center gap-2.5 rounded-xl border border-accent/30 bg-panel/90 py-2.5 pl-3 pr-4 text-sm font-medium text-fg shadow-glow backdrop-blur"
        >
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
          {toast.text}
        </div>
      ))}
    </div>
  );
}
