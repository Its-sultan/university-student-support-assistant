import { useChat } from "@/hooks/useChat";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import WelcomeScreen from "./WelcomeScreen";

// The main conversation area: messages (or welcome) + the composer.
export default function ChatPanel() {
  const { messages, input, setInput, sendMessage, sending, error } = useChat();
  const empty = messages.length === 0;

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-3 py-5 sm:px-4 sm:py-6">
          {empty ? <WelcomeScreen onPick={setInput} /> : <MessageList messages={messages} error={error} />}
          {empty && error && (
            <div className="mt-5 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-background/80 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl px-3 py-3 sm:px-4 sm:py-4">
          <ChatInput value={input} onChange={setInput} onSend={sendMessage} disabled={sending} />
          <p className="mt-2 text-center text-[11px] sm:text-xs text-muted-foreground">
            Answers come from a locally hosted LLM and may be imperfect. Verify with the relevant office.
          </p>
        </div>
      </div>
    </div>
  );
}
