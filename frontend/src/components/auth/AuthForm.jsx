import { useState } from "react";
import { LuLoader, LuUser, LuLock } from "react-icons/lu";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Login / signup form card. Calls onSuccess() after authenticating.
export default function AuthForm({ initialMode = "login", onSuccess }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (username.trim().length < 3) return setError("Username must be at least 3 characters.");
    if (password.length < 4) return setError("Password must be at least 4 characters.");

    setLoading(true);
    try {
      const fn = mode === "login" ? login : signup;
      await fn(username.trim(), password);
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
        {["login", "signup"].map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError("");
            }}
            className={`rounded-md py-2 text-sm font-medium transition-all ${
              mode === m ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
            }`}
          >
            {m === "login" ? "Log in" : "Create account"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <LuUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            className="pl-9"
            placeholder="Username"
            value={username}
            autoComplete="username"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="relative">
          <LuLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            className="pl-9"
            type="password"
            placeholder="Password"
            value={password}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <LuLoader className="animate-spin" size={16} />}
          {mode === "login" ? "Log in" : "Create account"}
        </Button>
      </form>
    </div>
  );
}
