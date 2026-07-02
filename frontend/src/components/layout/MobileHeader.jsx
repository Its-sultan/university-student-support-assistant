import { useNavigate } from "react-router-dom";
import { LuMenu, LuPlus } from "react-icons/lu";
import { useChat } from "@/hooks/useChat";
import Logo from "@/components/common/Logo";

// Top bar shown only on mobile: menu (opens drawer), brand, new chat.
export default function MobileHeader({ onMenu }) {
  const navigate = useNavigate();
  const { newChat } = useChat();

  const handleNew = async () => {
    await newChat();
    navigate("/chat");
  };

  return (
    <header className="flex items-center justify-between border-b border-border bg-card/70 px-3 py-2.5 backdrop-blur md:hidden">
      <button
        onClick={onMenu}
        aria-label="Open menu"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <LuMenu size={20} />
      </button>

      <div className="flex items-center gap-2">
        <Logo size={26} />
        <span className="text-sm font-semibold">Student Support</span>
      </div>

      <button
        onClick={handleNew}
        aria-label="New chat"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <LuPlus size={20} />
      </button>
    </header>
  );
}
