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
          className="animate-toast-in rounded-xl border border-accent/30 bg-panel/90 px-4 py-2.5 text-sm font-medium text-fg shadow-glow backdrop-blur"
        >
          {toast.text}
        </div>
      ))}
    </div>
  );
}
