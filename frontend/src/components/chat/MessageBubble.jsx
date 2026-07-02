import ReactMarkdown from "react-markdown";
import { FiUser } from "react-icons/fi";
import Logo from "@/components/common/Logo";
import { cn } from "@/utils/cn";
import TypingDots from "./TypingDots";
import AnswerRating from "./AnswerRating";

// One chat message. Assistant answers render markdown and can be rated.
// `streaming` shows a blinking caret while tokens are still arriving.
// `question` is the preceding user question (used for rating the answer).
export default function MessageBubble({ role, content, streaming = false, question }) {
  const isUser = role === "user";

  return (
    <div className={cn("flex w-full gap-2.5 sm:gap-3 animate-fade-in", isUser && "flex-row-reverse")}>
      {isUser ? (
        <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background shadow-sm">
          <FiUser size={15} />
        </div>
      ) : (
        <Logo size={34} className="shrink-0 shadow-sm rounded-full" />
      )}

      <div
        className={cn(
          "max-w-[85%] sm:max-w-[78%] rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-card border border-border rounded-tl-sm"
        )}
      >
        {!content && streaming ? (
          <TypingDots />
        ) : isUser ? (
          <span className="whitespace-pre-wrap">{content}</span>
        ) : (
          <div className="prose-chat">
            <ReactMarkdown>{content}</ReactMarkdown>
            {streaming && (
              <span className="ml-0.5 inline-block h-4 w-[2px] -mb-0.5 bg-primary animate-blink" />
            )}
            {!streaming && content && !content.startsWith("\n[Error]") && (
              <AnswerRating question={question} answer={content} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
