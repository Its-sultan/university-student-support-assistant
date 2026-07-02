import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuPlus, LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import Logo from "@/components/common/Logo";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { cn } from "@/utils/cn";
import ChatListItem from "./ChatListItem";
import UserMenu from "./UserMenu";

// `collapsed` shrinks the sidebar to an icon rail (desktop only).
// `onToggleCollapse` is omitted in the mobile drawer (always expanded there).
export default function Sidebar({ health, onNavigate, collapsed = false, onToggleCollapse }) {
  const navigate = useNavigate();
  const { chats, activeId, openChat, newChat, deleteChat, renameChat } = useChat();
  const [pendingDelete, setPendingDelete] = useState(null);

  const status =
    health?.status === "ok"
      ? { color: "bg-green-500", label: "Model ready" }
      : health?.backend === "down"
      ? { color: "bg-red-500", label: "Backend offline" }
      : { color: "bg-amber-500", label: "Model loading" };

  const handleNew = async () => {
    await newChat();
    navigate("/chat");
    onNavigate?.();
  };
  const handleSelect = async (id) => {
    await openChat(id);
    navigate("/chat");
    onNavigate?.();
  };

  const pendingChat = chats.find((c) => c.id === pendingDelete);

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-border bg-card/60 backdrop-blur transition-[width] duration-200",
        collapsed ? "w-16 items-center" : "w-72"
      )}
    >
      {/* Header */}
      <div className={cn("flex items-center py-4", collapsed ? "justify-center px-0" : "gap-2 px-4")}>
        <Logo size={collapsed ? 30 : 34} />
        {!collapsed && (
          <>
            <span className="flex-1 text-sm font-semibold leading-tight">
              Student Support
              <br />
              <span className="text-xs font-normal text-muted-foreground">Assistant</span>
            </span>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <LuPanelLeftClose size={18} />
              </button>
            )}
          </>
        )}
      </div>

      {collapsed && onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="mb-1 flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="Expand sidebar"
          title="Expand sidebar"
        >
          <LuPanelLeftOpen size={18} />
        </button>
      )}

      {/* New chat */}
      <div className={cn(collapsed ? "px-0" : "px-3 w-full")}>
        {collapsed ? (
          <button
            onClick={handleNew}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label="New chat"
            title="New chat"
          >
            <LuPlus size={18} />
          </button>
        ) : (
          <Button onClick={handleNew} className="w-full justify-start gap-2">
            <LuPlus size={16} /> New chat
          </Button>
        )}
      </div>

      {/* Chat list (hidden when collapsed) */}
      {!collapsed && (
        <div className="mt-4 flex-1 overflow-y-auto px-2">
          <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Recent
          </p>
          {chats.length === 0 ? (
            <p className="px-2 py-4 text-sm text-muted-foreground">No conversations yet.</p>
          ) : (
            <ul className="space-y-1">
              {chats.map((c) => (
                <li key={c.id}>
                  <ChatListItem
                    chat={c}
                    active={activeId === c.id}
                    onSelect={() => handleSelect(c.id)}
                    onRename={(title) => renameChat(c.id, title)}
                    onRequestDelete={() => setPendingDelete(c.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {collapsed && <div className="flex-1" />}

      {/* Footer */}
      <div className={cn("border-t border-border", collapsed ? "w-full px-2 py-3" : "p-3")}>
        {!collapsed && (
          <div className="mb-2 flex items-center gap-2 px-1 text-xs text-muted-foreground">
            <span className={cn("h-2 w-2 rounded-full", status.color)} />
            {status.label}
          </div>
        )}
        <UserMenu collapsed={collapsed} />
      </div>

      <ConfirmDialog
        open={pendingDelete != null}
        title="Delete this chat?"
        description={
          pendingChat
            ? `“${pendingChat.title}” and all its messages will be permanently deleted.`
            : "This conversation will be permanently deleted."
        }
        confirmText="Delete"
        variant="destructive"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          deleteChat(pendingDelete);
          setPendingDelete(null);
        }}
      />
    </aside>
  );
}
