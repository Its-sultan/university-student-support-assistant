import { LuSun, LuMoon } from "react-icons/lu";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/utils/cn";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        className
      )}
    >
      {isDark ? <LuSun size={18} /> : <LuMoon size={18} />}
    </button>
  );
}
