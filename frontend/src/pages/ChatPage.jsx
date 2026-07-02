import ChatPanel from "@/components/chat/ChatPanel";

// The app shell (sidebar + responsive layout) is provided by AppShell in the
// router, so the page itself is just the conversation panel.
export default function ChatPage() {
  return <ChatPanel />;
}
