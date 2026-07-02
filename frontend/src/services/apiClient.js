// Base HTTP client: shared base URL, auth headers, and error handling.
// All service modules build on top of this.
import { tokenStore } from "./tokenStore";

export const BASE_URL = "http://localhost:8000";

export function authHeaders() {
  const token = tokenStore.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function jsonHeaders() {
  return { "Content-Type": "application/json", ...authHeaders() };
}

// Parse a JSON response, throwing a clean Error (with .status) on failure.
export async function handle(res) {
  if (!res.ok) {
    let detail = "Something went wrong.";
    try {
      detail = (await res.json()).detail || detail;
    } catch {
      /* ignore body parse error */
    }
    const err = new Error(detail);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// Wrap a fetch call so a network failure becomes a friendly message
// (this is how we detect "backend is not running").
export function withNetworkGuard(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (e) {
      if (e instanceof TypeError) {
        throw new Error("Cannot connect to the server. Is the backend running?");
      }
      throw e;
    }
  };
}
