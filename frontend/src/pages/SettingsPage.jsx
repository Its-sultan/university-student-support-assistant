import { useNavigate } from "react-router-dom";
import {
  LuArrowLeft, LuSun, LuMoon, LuMonitor, LuUser, LuShieldCheck,
  LuCpu, LuServer, LuCircleCheck, LuCircleX,
} from "react-icons/lu";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useHealth } from "@/hooks/useHealth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils/cn";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const health = useHealth(true);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10">
        <Button variant="ghost" className="mb-4 gap-1.5 px-2" onClick={() => navigate("/chat")}>
          <LuArrowLeft size={16} /> Back to chat
        </Button>

        <h1 className="mb-6 text-2xl font-bold tracking-tight">Settings</h1>

        {/* Appearance */}
        <Section title="Appearance" icon={LuMonitor}>
          <p className="mb-3 text-sm text-muted-foreground">Choose how the app looks.</p>
          <div className="grid grid-cols-2 gap-2">
            <ThemeOption active={theme === "light"} onClick={() => setTheme("light")} icon={LuSun} label="Light" />
            <ThemeOption active={theme === "dark"} onClick={() => setTheme("dark")} icon={LuMoon} label="Dark" />
          </div>
        </Section>

        {/* Account */}
        <Section title="Account" icon={LuUser}>
          <Row icon={LuUser} label="Username" value={user} />
          <Row icon={LuShieldCheck} label="Authentication" value="Password (stored hashed)" last />
        </Section>

        {/* System */}
        <Section title="System" icon={LuServer}>
          <Row icon={LuCpu} label="Model" value={health?.model || "—"} />
          <Row
            icon={health?.ollama_reachable ? LuCircleCheck : LuCircleX}
            label="Local LLM (Ollama)"
            value={health?.ollama_reachable ? "Connected" : "Offline"}
            valueClass={health?.ollama_reachable ? "text-green-600 dark:text-green-400" : "text-destructive"}
          />
          <Row
            icon={health?.backend === "running" ? LuCircleCheck : LuCircleX}
            label="Backend"
            value={health?.backend === "running" ? "Running" : "Offline"}
            valueClass={health?.backend === "running" ? "text-green-600 dark:text-green-400" : "text-destructive"}
            last
          />
        </Section>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          University Student Support Assistant · IS 365 · Self-hosted LLM
        </p>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <Card className="mb-5 p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Icon size={16} /> {title}
      </div>
      {children}
    </Card>
  );
}

function ThemeOption({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all",
        active
          ? "border-primary bg-accent text-accent-foreground ring-2 ring-ring"
          : "border-border bg-card hover:bg-muted"
      )}
    >
      <Icon size={16} /> {label}
    </button>
  );
}

function Row({ icon: Icon, label, value, valueClass, last }) {
  return (
    <div className={cn("flex items-center justify-between py-3", !last && "border-b border-border")}>
      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <Icon size={15} /> {label}
      </div>
      <span className={cn("text-sm font-medium capitalize", valueClass)}>{value}</span>
    </div>
  );
}
