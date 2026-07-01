import type { ReactNode } from 'react';

interface CollapseProps {
  hidden: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Smoothly collapses its children to zero height (Zen mode). Uses the
 * grid-template-rows 0fr/1fr trick so content of any height animates cleanly.
 */
export function Collapse({ hidden, children, className = '' }: CollapseProps) {
  return (
    <div
      aria-hidden={hidden}
      className={`grid transition-[grid-template-rows,opacity] duration-700 ease-(--ease-spring) ${
        hidden ? 'pointer-events-none grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'
      } ${className}`}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}
