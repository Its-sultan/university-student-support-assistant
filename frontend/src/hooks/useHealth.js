import { useState, useEffect } from "react";
import { healthService } from "@/services/healthService";

// Polls the backend health endpoint so the UI can show a live status dot.
export function useHealth(enabled = true, intervalMs = 15000) {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    const poll = () => healthService.check().then((h) => active && setHealth(h));
    poll();
    const t = setInterval(poll, intervalMs);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, [enabled, intervalMs]);

  return health;
}
