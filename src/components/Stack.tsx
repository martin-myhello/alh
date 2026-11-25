"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Shot } from "./Shot";

const THROW = 80;

/**
 * The pile of screenshots on a card. Drag or swipe the top one sideways to send it
 * to the back and see the next; a plain click opens the note.
 */
export function Stack({ shots, href }: { shots: string[]; href: string }) {
  const router = useRouter();
  // order[last] is the screenshot on top of the pile.
  const [order, setOrder] = useState(() => shots.map((_, i) => i).reverse());
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [thrown, setThrown] = useState<number | null>(null);
  const start = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  const top = order[order.length - 1];
  const many = shots.length > 1;

  const next = (direction: number) => {
    setThrown(direction);
    setTimeout(() => {
      setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]);
      setThrown(null);
      setDrag(null);
    }, 200);
  };

  const topStyle = (): React.CSSProperties | undefined => {
    if (thrown !== null)
      return {
        transform: `translate(calc(-50% + ${thrown * 520}px), ${(drag?.y ?? 0) + 30}px) rotate(${thrown * 22}deg)`,
        opacity: 0,
        transition: "transform 0.2s ease-in, opacity 0.2s ease-in",
      };
    if (drag)
      return {
        transform: `translate(calc(-50% + ${3 + drag.x}px), ${drag.y}px) rotate(${4 + drag.x / 16}deg)`,
        transition: "none",
      };
  };

  return (
    <div
      className={`stack${many ? " swipe" : ""}${drag ? " dragging" : ""}`}
      onPointerDown={(e) => {
        if (e.button !== 0 || thrown !== null) return;
        start.current = { x: e.clientX, y: e.clientY, moved: false };
        if (many) e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const s = start.current;
        if (!s || !many) return;
        const x = e.clientX - s.x;
        const y = e.clientY - s.y;
        if (!s.moved && Math.hypot(x, y) < 6) return;
        s.moved = true;
        setDrag({ x, y: y * 0.35 });
      }}
      onPointerUp={() => {
        const s = start.current;
        start.current = null;
        if (!s) return;
        if (!s.moved) return router.push(href);
        if (drag && Math.abs(drag.x) > THROW) next(Math.sign(drag.x));
        else setDrag(null);
      }}
      onPointerCancel={() => {
        start.current = null;
        setDrag(null);
      }}
      onKeyDown={(e) => {
        if (!many) return;
        if (e.key === "ArrowRight") next(1);
        if (e.key === "ArrowLeft") next(-1);
      }}
      tabIndex={many ? 0 : undefined}
      role={many ? "group" : undefined}
      aria-label={many ? `Screenshots, ${shots.indexOf(shots[top]) + 1} of ${shots.length}. Swipe or use arrow keys` : undefined}
    >
      {order.map((i) => (
        <span key={i} className="shot-wrap" style={i === top ? topStyle() : undefined}>
          <Shot src={shots[i]} />
        </span>
      ))}
      {many && (
        <div className="pager" aria-hidden="true">
          {shots.map((_, i) => (
            <i key={i} className={i === top ? "on" : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
