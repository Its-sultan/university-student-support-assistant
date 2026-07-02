import { useRef, useEffect } from "react";
import { LuSendHorizontal, LuLoader } from "react-icons/lu";
import { cn } from "@/utils/cn";

// Auto-growing textarea with the send button positioned INSIDE the container.
// Enter sends; Shift+Enter makes a new line.
export default function ChatInput({ value, onChange, onSend, disabled }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [value]);

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) onSend();
    }
  }

  const canSend = !disabled && value.trim().length > 0;

  return (
    <div className="relative flex items-end rounded-2xl border border-input bg-card shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:border-ring transition-all">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder="Ask about registration, exams, library, hostels, fees…"
        className="max-h-40 flex-1 resize-none bg-transparent px-4 py-3.5 pr-14 text-sm outline-none placeholder:text-muted-foreground"
      />
      <button
        type="button"
        onClick={onSend}
        disabled={!canSend}
        aria-label="Send"
        className={cn(
          "absolute bottom-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-xl transition-all",
          canSend
            ? "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 shadow-sm"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        )}
      >
        {disabled ? (
          <LuLoader size={17} className="animate-spin" />
        ) : (
          <LuSendHorizontal size={17} />
        )}
      </button>
    </div>
  );
}
