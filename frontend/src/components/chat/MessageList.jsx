import { useEffect, useRef } from "react";
import { LuTriangleAlert } from "react-icons/lu";
import MessageBubble from "./MessageBubble";

// Scrollable list of messages; auto-scrolls to the bottom on new content.
export default function MessageList({ messages, error }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="space-y-5">
      {messages.map((m, i) => (
        <MessageBubble
          key={m.id ?? i}
          role={m.role}
          content={m.content}
          streaming={m.streaming}
          question={m.role === "assistant" ? messages[i - 1]?.content : undefined}
        />
      ))}

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <LuTriangleAlert size={16} /> {error}
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
