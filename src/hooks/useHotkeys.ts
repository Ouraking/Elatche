import { useEffect, useRef } from 'react';

export type HotkeyMap = Record<string, () => void>;

const isEditable = (el: EventTarget | null): boolean => {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
};

/**
 * Global hotkeys that gracefully bypass form fields. Keys are lowercase
 * (e.g. 'r', 'n'); the space bar is exposed as 'space'.
 */
export function useHotkeys(bindings: HotkeyMap): void {
  const ref = useRef(bindings);
  ref.current = bindings;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isEditable(e.target)) return;
      const key = e.code === 'Space' ? 'space' : e.key.toLowerCase();
      const handler = ref.current[key];
      if (handler) {
        e.preventDefault();
        handler();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
