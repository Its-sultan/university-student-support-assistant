import { useLocation, useNavigate, Link } from "react-router-dom";
import Logo from "@/components/common/Logo";
import { Card } from "@/components/ui/card";
import AuthForm from "@/components/auth/AuthForm";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialMode = location.state?.mode === "signup" ? "signup" : "login";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-accent/40 to-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Link to="/">
            <Logo size={60} className="mb-3 drop-shadow-lg" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">University Support Assistant</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to save and revisit your conversations.
          </p>
        </div>

        <Card className="p-6">
          <AuthForm initialMode={initialMode} onSuccess={() => navigate("/chat")} />
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Your data stays on this machine · Self-hosted LLM · IS 365
        </p>
      </div>
    </div>
  );
}
