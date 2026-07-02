// Backend + model health check (drives the status indicator).
import { BASE_URL } from "./apiClient";

export const healthService = {
  check: async () => {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      return await res.json();
    } catch {
      return { status: "unreachable", backend: "down" };
    }
  },
};
