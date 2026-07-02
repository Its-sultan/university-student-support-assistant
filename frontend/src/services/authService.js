// Authentication API calls (Bonus D).
import { BASE_URL, handle, withNetworkGuard } from "./apiClient";

export const authService = {
  signup: withNetworkGuard(async (username, password) => {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return handle(res);
  }),

  login: withNetworkGuard(async (username, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return handle(res);
  }),
};
