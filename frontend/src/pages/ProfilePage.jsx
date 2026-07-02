import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuArrowLeft, LuMessageSquare, LuLogOut, LuSettings, LuUser,
  LuShieldCheck, LuPlus, LuChevronRight, LuPalette,
} from "react-icons/lu";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ConfirmDialog from "@/components/common/ConfirmDialog";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { chats, openChat } = useChat();
  const { theme } = useTheme();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const recent = chats.slice(0, 5);

  const openConversation = async (id) => {
    await openChat(id);
    navigate("/chat");
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10">
        <Button variant="ghost" className="mb-4 gap-1.5 px-2" onClick={() => navigate("/chat")}>
          <LuArrowLeft size={16} /> Back to chat
        </Button>

        {/* Identity */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/20 via-accent to-accent p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-3xl font-bold text-primary-foreground shadow-lg ring-4 ring-card/40">
                {user?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-bold capitalize">{user}</h1>
                <p className="text-sm text-muted-foreground">University Student</p>
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                  <LuShieldCheck size={12} /> Active account
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
            <Stat icon={LuMessageSquare} value={chats.length} label="Conversations" />
            <Stat icon={LuPalette} value={theme} label="Theme" capitalize />
            <Stat icon={LuShieldCheck} value="Secure" label="Stored hashed" />
          </div>
        </Card>

        {/* Quick actions */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-auto justify-start gap-3 py-3" onClick={() => navigate("/chat")}>
            <LuPlus size={18} className="text-primary" />
            <span className="text-left">
              <span className="block text-sm font-medium">New chat</span>
              <span className="block text-xs text-muted-foreground">Ask a question</span>
            </span>
          </Button>
          <Button variant="outline" className="h-auto justify-start gap-3 py-3" onClick={() => navigate("/settings")}>
            <LuSettings size={18} className="text-primary" />
            <span className="text-left">
              <span className="block text-sm font-medium">Settings</span>
              <span className="block text-xs text-muted-foreground">Theme & system</span>
            </span>
          </Button>
        </div>

        {/* Account details */}
        <Card className="mt-5 p-5">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Account</h2>
          <Row icon={LuUser} label="Username" value={user} />
          <Row icon={LuShieldCheck} label="Authentication" value="Password (hashed)" last />
        </Card>

        {/* Recent conversations */}
        <Card className="mt-5 p-5">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Recent conversations</h2>
          {recent.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">No conversations yet.</p>
          ) : (
            <ul className="space-y-1">
              {recent.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => openConversation(c.id)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2.5 text-left text-sm transition-colors hover:bg-muted"
                  >
                    <LuMessageSquare size={15} className="shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">{c.title}</span>
                    <LuChevronRight size={15} className="text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Button variant="destructive" className="mt-5 w-full gap-2" onClick={() => setConfirmLogout(true)}>
          <LuLogOut size={16} /> Log out
        </Button>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        title="Log out?"
        description="You'll need to log in again to access your saved conversations."
        confirmText="Log out"
        variant="destructive"
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => {
          setConfirmLogout(false);
          logout();
          navigate("/");
        }}
      />
    </div>
  );
}

function Stat({ icon: Icon, value, label, capitalize }) {
  return (
    <div className="flex flex-col items-center gap-1 p-4">
      <Icon size={18} className="text-primary" />
      <span className={`text-lg font-bold ${capitalize ? "capitalize" : ""}`}>{value}</span>
      <span className="text-center text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function Row({ icon: Icon, label, value, last }) {
  return (
    <div className={`flex items-center justify-between py-3 ${last ? "" : "border-b border-border"}`}>
      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <Icon size={15} /> {label}
      </div>
      <span className="text-sm font-medium capitalize">{value}</span>
    </div>
  );
}
