import { useNavigate } from "react-router-dom";
import {
  LuBookOpen, LuCalendarDays, LuLibrary, LuMonitor, LuHouse, LuWallet,
  LuArrowRight, LuShieldCheck, LuZap, LuLock,
} from "react-icons/lu";
import { useAuth } from "@/hooks/useAuth";
import Logo from "@/components/common/Logo";
import ThemeToggle from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";

const SERVICES = [
  { icon: LuBookOpen, label: "Course Registration" },
  { icon: LuShieldCheck, label: "Examination Rules" },
  { icon: LuLibrary, label: "Library Services" },
  { icon: LuMonitor, label: "ICT Support" },
  { icon: LuHouse, label: "Hostel Application" },
  { icon: LuWallet, label: "Fee Payment" },
  { icon: LuCalendarDays, label: "Academic Calendar" },
  { icon: LuShieldCheck, label: "Student Conduct" },
];

const HIGHLIGHTS = [
  { icon: LuZap, title: "Instant answers", text: "Streamed responses from a locally hosted AI model — no waiting on the cloud." },
  { icon: LuLock, title: "Private by design", text: "Runs on the university's own machine; student data never leaves it." },
  { icon: LuShieldCheck, title: "Always available", text: "Ask anytime about registration, exams, fees, hostels and more." },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-accent/30 to-background">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Logo size={36} />
          <span className="font-semibold">University Support Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <Button onClick={() => navigate("/chat")} className="gap-1.5">
              Open app <LuArrowRight size={16} />
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate("/login")}>Log in</Button>
              <Button onClick={() => navigate("/login", { state: { mode: "signup" } })}>
                Get started
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 pb-10 pt-12 text-center sm:pt-20">
        <div className="mx-auto mb-6 w-fit">
          <Logo size={76} className="drop-shadow-xl" />
        </div>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Your university help desk,
          <br />
          <span className="bg-gradient-to-r from-primary to-[#7c5cf0] bg-clip-text text-transparent">
            powered by AI
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Get clear answers about university services in seconds. Ask about course registration,
          exams, the library, ICT, hostels, fees, and more — any time of day.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            className="w-full gap-2 sm:w-auto"
            onClick={() => navigate(isAuthenticated ? "/chat" : "/login", isAuthenticated ? undefined : { state: { mode: "signup" } })}
          >
            {isAuthenticated ? "Open the assistant" : "Start chatting free"} <LuArrowRight size={18} />
          </Button>
          {!isAuthenticated && (
            <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => navigate("/login")}>
              I already have an account
            </Button>
          )}
        </div>
      </section>

      {/* Highlights */}
      <section className="mx-auto grid max-w-5xl gap-4 px-4 py-8 sm:grid-cols-3 sm:px-6">
        {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Icon size={22} />
            </div>
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
      </section>

      {/* Services */}
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h2 className="text-center text-xl font-bold sm:text-2xl">Everything a student asks about</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SERVICES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
              <Icon size={18} className="shrink-0 text-primary" />
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA footer */}
      <section className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 to-accent p-8 sm:p-12">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to get answers?</h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Create a free account and start asking. Your conversations are saved so you can come back anytime.
          </p>
          <Button
            size="lg"
            className="mt-6 gap-2"
            onClick={() => navigate(isAuthenticated ? "/chat" : "/login", isAuthenticated ? undefined : { state: { mode: "signup" } })}
          >
            {isAuthenticated ? "Open the assistant" : "Create your account"} <LuArrowRight size={18} />
          </Button>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          IS 365 · Self-Hosted LLM Application Pipeline
        </p>
      </section>
    </div>
  );
}
