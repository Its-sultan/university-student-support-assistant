// Chat + message API calls, including the streaming ask.
import { BASE_URL, authHeaders, jsonHeaders, handle, withNetworkGuard } from "./apiClient";

export const chatService = {
  list: withNetworkGuard(async () => {
    const res = await fetch(`${BASE_URL}/chats`, { headers: authHeaders() });
    return handle(res);
  }),

  create: withNetworkGuard(async () => {
    const res = await fetch(`${BASE_URL}/chats`, { method: "POST", headers: authHeaders() });
    return handle(res);
  }),

  get: withNetworkGuard(async (id) => {
    const res = await fetch(`${BASE_URL}/chats/${id}`, { headers: authHeaders() });
    return handle(res);
  }),

  rename: withNetworkGuard(async (id, title) => {
    const res = await fetch(`${BASE_URL}/chats/${id}`, {
      method: "PATCH",
      headers: jsonHeaders(),
      body: JSON.stringify({ title }),
    });
    return handle(res);
  }),

  remove: withNetworkGuard(async (id) => {
    const res = await fetch(`${BASE_URL}/chats/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return handle(res);
  }),

  /**
   * Ask a question with streaming. Calls onChunk(text) for each chunk and
   * resolves with the full answer string. Throws a clear message on failure.
   */
  askStream: async (chatId, question, onChunk) => {
    let res;
    try {
      res = await fetch(`${BASE_URL}/chats/${chatId}/ask/stream`, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ question }),
      });
    } catch {
      throw new Error("Cannot connect to the server. Is the backend running?");
    }
    if (!res.ok) return handle(res); // throws (401, 503, …)

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      full += text;
      onChunk(text);
    }
    return full;
  },
};
