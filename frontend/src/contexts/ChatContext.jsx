import { createContext, useState, useEffect, useCallback } from "react";
import { chatService } from "@/services/chatService";
import { useAuth } from "@/hooks/useAuth";

export const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { logout } = useAuth();

  const [chats, setChats] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // If a request 401s, the session is dead -> log out.
  const guard = useCallback(
    (e) => {
      if (e.status === 401) logout();
      else setError(e.message);
    },
    [logout]
  );

  const refreshChats = useCallback(async () => {
    try {
      const list = await chatService.list();
      setChats(list);
      return list;
    } catch (e) {
      guard(e);
      return [];
    }
  }, [guard]);

  useEffect(() => {
    refreshChats();
  }, [refreshChats]);

  const openChat = useCallback(
    async (id) => {
      setActiveId(id);
      setError("");
      try {
        const chat = await chatService.get(id);
        setMessages(chat.messages || []);
      } catch (e) {
        guard(e);
      }
    },
    [guard]
  );

  const newChat = useCallback(async () => {
    setError("");
    try {
      const chat = await chatService.create();
      await refreshChats();
      setActiveId(chat.id);
      setMessages([]);
      return chat.id;
    } catch (e) {
      guard(e);
    }
  }, [guard, refreshChats]);

  const renameChat = useCallback(
    async (id, title) => {
      const clean = title.trim();
      if (!clean) return;
      // Optimistic update, then persist.
      setChats((cs) => cs.map((c) => (c.id === id ? { ...c, title: clean } : c)));
      try {
        await chatService.rename(id, clean);
      } catch (e) {
        guard(e);
        refreshChats();
      }
    },
    [guard, refreshChats]
  );

  const deleteChat = useCallback(
    async (id) => {
      try {
        await chatService.remove(id);
        await refreshChats();
        if (activeId === id) {
          setActiveId(null);
          setMessages([]);
        }
      } catch (e) {
        guard(e);
      }
    },
    [activeId, guard, refreshChats]
  );

  const sendMessage = useCallback(async () => {
    const question = input.trim();
    if (!question || sending) return;
    setError("");

    let chatId = activeId;
    if (!chatId) {
      chatId = await newChat();
      if (!chatId) return;
    }

    setInput("");
    setSending(true);
    setMessages((m) => [
      ...m,
      { role: "user", content: question },
      { role: "assistant", content: "", streaming: true },
    ]);

    try {
      await chatService.askStream(chatId, question, (chunk) => {
        setMessages((m) => {
          const copy = [...m];
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { ...last, content: last.content + chunk };
          return copy;
        });
      });
    } catch (e) {
      if (e.status === 401) return logout();
      setError(e.message);
      setMessages((m) => {
        const copy = [...m];
        const last = copy[copy.length - 1];
        if (last?.role === "assistant" && !last.content) copy.pop();
        return copy;
      });
    } finally {
      setMessages((m) => {
        const copy = [...m];
        const last = copy[copy.length - 1];
        if (last?.role === "assistant") copy[copy.length - 1] = { ...last, streaming: false };
        return copy;
      });
      setSending(false);
      refreshChats();
    }
  }, [activeId, input, sending, newChat, refreshChats, logout]);

  const value = {
    chats, activeId, messages, input, sending, error,
    setInput, openChat, newChat, deleteChat, renameChat, sendMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
