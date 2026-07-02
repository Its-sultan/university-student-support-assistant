// Answer-rating feedback (Bonus E). Best-effort — never blocks the UI.
import { BASE_URL, jsonHeaders } from "./apiClient";

export const feedbackService = {
  send: async (question, answer, rating) => {
    try {
      await fetch(`${BASE_URL}/feedback`, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ question, answer, rating }),
      });
    } catch {
      /* ignore */
    }
  },
};
