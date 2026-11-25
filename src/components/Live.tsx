"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Keeps the unread badge and feeds fresh: re-reads the page data every 20s while the tab is visible. */
export function Live() {
  const router = useRouter();
  useEffect(() => {
    const tick = () => document.visibilityState === "visible" && router.refresh();
    const timer = setInterval(tick, 20_000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [router]);
  return null;
}
