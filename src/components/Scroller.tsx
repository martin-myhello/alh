"use client";

import { useEffect, useRef } from "react";

/** A horizontally scrolling strip that opens with `focus` (px from the left) a third of the way in. */
export function Scroller({ focus, className, children }: { focus: number; className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollLeft = Math.max(0, focus - el.clientWidth / 3);
  }, [focus]);

  return (
    <div
      ref={ref}
      className={className}
      tabIndex={0}
      role="region"
      aria-label="Timeline, scrolls sideways"
      // A plain mouse wheel scrolls sideways too; trackpads and shift+wheel already do.
      onWheel={(e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && !e.shiftKey && ref.current) ref.current.scrollLeft += e.deltaY;
      }}
    >
      {children}
    </div>
  );
}
