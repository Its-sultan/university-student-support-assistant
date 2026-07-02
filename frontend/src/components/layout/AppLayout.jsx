import { useState } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import MobileHeader from "./MobileHeader";
import { cn } from "@/utils/cn";

const COLLAPSE_KEY = "ussa_sidebar_collapsed";

// Responsive app shell:
//  - md and up: sidebar is a static column that can collapse to an icon rail.
//  - below md: sidebar becomes a slide-in drawer with a dimmed overlay.
export default function AppLayout({ health, children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_KEY) === "1"
  );

  const toggleCollapse = () => {
    setCollapsed((c) => {
      localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1");
      return !c;
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar health={health} collapsed={collapsed} onToggleCollapse={toggleCollapse} />
      </div>

      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden",
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Mobile drawer (always expanded) */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 shadow-xl transition-transform duration-300 md:hidden",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar health={health} onNavigate={() => setDrawerOpen(false)} />
      </div>

      {/* Main column */}
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <MobileHeader onMenu={() => setDrawerOpen(true)} />
        {children}
      </div>
    </div>
  );
}
