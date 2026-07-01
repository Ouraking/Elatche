import { useEffect, useState } from 'react';
import { todayKey } from '../lib/date';

/** The current YYYY-MM-DD key, refreshed automatically across midnight. */
export function useToday(): string {
  const [key, setKey] = useState(todayKey);
  useEffect(() => {
    const id = setInterval(() => {
      const next = todayKey();
      setKey((prev) => (prev === next ? prev : next));
    }, 30_000);
    return () => clearInterval(id);
  }, []);
  return key;
}
