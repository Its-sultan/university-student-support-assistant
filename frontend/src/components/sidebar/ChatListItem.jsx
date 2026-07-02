import { useState, useRef, useEffect } from "react";
import {
  LuMessageSquare, LuTrash2, LuPencil, LuCheck, LuX, LuEllipsis,
} from "react-icons/lu";
import { useClickOutside } from "@/hooks/useClickOutside";
import { cn } from "@/utils/cn";

export default function ChatListItem({ chat, active, onSelect, onRename, onRequestDelete }) {
  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [value, setValue] = useState(chat.title);
  const inputRef = useRef(null);
  const menuRef = useClickOutside(() => setMenuOpen(false));

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function startEdit(e) {
    e?.stopPropagation();
    setMenuOpen(false);
    setValue(chat.title);
    setEditing(true);
  }
  function commit() {
    const next = value.trim();
    if (next && next !== chat.title) onRename(next);
    setEditing(false);
  }
  function cancel() {
    setValue(chat.title);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1 rounded-lg bg-accent px-2 py-1.5">
        <LuMessageSquare size={15} className="shrink-0 opacity-70" />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") cancel();
          }}
          maxLength={80}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
        <button onClick={(e) => { e.stopPropagation(); commit(); }} className="hover:text-primary" aria-label="Save">
          <LuCheck size={15} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); cancel(); }} className="hover:text-destructive" aria-label="Cancel">
          <LuX size={15} />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      onDoubleClick={startEdit}
      className={cn(
        "group relative flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors",
        active ? "bg-accent text-accent-foreground" : "hover:bg-muted"
      )}
    >
      <LuMessageSquare size={15} className="shrink-0 opacity-70" />
      <span className="flex-1 truncate">{chat.title}</span>

      {/* Ellipsis trigger */}
      <button
        onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-opacity hover:bg-background/60",
          menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus:opacity-100"
        )}
        aria-label="Chat options"
      >
        <LuEllipsis size={16} />
      </button>

      {/* Dropdown menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          className="absolute right-1 top-9 z-20 w-36 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-xl animate-fade-in"
        >
          <button
            onClick={startEdit}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted"
          >
            <LuPencil size={14} /> Rename
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onRequestDelete(); }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
          >
            <LuTrash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
