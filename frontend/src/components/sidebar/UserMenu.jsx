import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuLogOut, LuUser, LuSettings, LuChevronUp } from "react-icons/lu";
import { useAuth } from "@/hooks/useAuth";
import { useClickOutside } from "@/hooks/useClickOutside";
import ConfirmDialog from "@/components/common/ConfirmDialog";

// Clicking the avatar/initial opens a menu: Profile · Settings · Log out.
// Logging out asks for confirmation first.
export default function UserMenu({ collapsed = false }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const ref = useClickOutside(() => setMenuOpen(false));

  const go = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const items = [
    { label: "Profile", icon: LuUser, onClick: () => go("/profile") },
    { label: "Settings", icon: LuSettings, onClick: () => go("/settings") },
    {
      label: "Log out",
      icon: LuLogOut,
      danger: true,
      onClick: () => {
        setMenuOpen(false);
        setConfirmLogout(true);
      },
    },
  ];

  return (
    <div className="relative" ref={ref}>
      {menuOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-full min-w-[180px] overflow-hidden rounded-xl border border-border bg-card p-1 shadow-xl animate-fade-in">
          {items.map(({ label, icon: Icon, onClick, danger }) => (
            <button
              key={label}
              onClick={onClick}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted ${
                danger ? "text-destructive hover:bg-destructive/10" : ""
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setMenuOpen((o) => !o)}
        className={`flex w-full items-center gap-2 rounded-lg bg-muted px-2 py-2 text-left transition-colors hover:bg-accent ${
          collapsed ? "justify-center" : ""
        }`}
        title={user}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
          {user?.[0]?.toUpperCase()}
        </div>
        {!collapsed && (
          <>
            <span className="flex-1 truncate text-sm font-medium">{user}</span>
            <LuChevronUp
              size={15}
              className={`text-muted-foreground transition-transform ${menuOpen ? "" : "rotate-180"}`}
            />
          </>
        )}
      </button>

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
