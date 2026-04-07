"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type AutoRefreshProps = {
  enabled?: boolean;
  intervalMs?: number;
};

export function AutoRefresh({
  enabled = true,
  intervalMs = 15000,
}: AutoRefreshProps) {
  const router = useRouter();
  const lastRefreshAtRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    function refreshIfVisible() {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }

      const now = Date.now();

      if (now - lastRefreshAtRef.current < 3000) {
        return;
      }

      lastRefreshAtRef.current = now;
      router.refresh();
    }

    const interval = window.setInterval(refreshIfVisible, intervalMs);
    window.addEventListener("focus", refreshIfVisible);
    document.addEventListener("visibilitychange", refreshIfVisible);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshIfVisible);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [enabled, intervalMs, router]);

  return null;
}
