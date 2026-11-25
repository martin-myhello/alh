"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Person } from "@/lib/types";
import { Avatar } from "./bits";

const HOLD = 2600;

/**
 * The row of faces on the feed. What each person is working on pops up above
 * them, one person at a time, from left to right. Hover a face to hold on it.
 */
export function People({ people, working }: { people: Person[]; working: Record<string, string[]> }) {
  const speakers = people.map((p, i) => (working[p.id]?.length ? i : -1)).filter((i) => i >= 0);
  const [turn, setTurn] = useState(0);
  const [held, setHeld] = useState<number | null>(null);

  useEffect(() => {
    if (held !== null || speakers.length < 2) return;
    const timer = setInterval(() => setTurn((t) => (t + 1) % speakers.length), HOLD);
    return () => clearInterval(timer);
  }, [held, speakers.length]);

  const active = held ?? speakers[turn % Math.max(speakers.length, 1)];

  return (
    <div className="people-wrap">
      <div className="people">
        {people.map((p, i) => (
          <Link
            key={p.id}
            className={`person${i === active ? " on" : ""}`}
            href={`/people/${p.id}`}
            onMouseEnter={() => working[p.id]?.length && setHeld(i)}
            onMouseLeave={() => {
              if (held === null) return;
              setTurn(Math.max(speakers.indexOf(held), 0));
              setHeld(null);
            }}
          >
            {working[p.id]?.length > 0 && (
              <span className={`bubbles${i >= people.length / 2 ? " r" : ""}`}>
                {working[p.id].map((title) => (
                  <span key={title} className="chip">
                    {title}
                  </span>
                ))}
              </span>
            )}
            <Avatar person={p} size={68} />
            {p.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
