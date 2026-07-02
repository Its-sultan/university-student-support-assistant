import Logo from "@/components/common/Logo";
import { SAMPLE_QUESTIONS } from "@/utils/constants";

// Shown when a chat has no messages yet.
export default function WelcomeScreen({ onPick }) {
  return (
    <div className="flex flex-col items-center pt-6 sm:pt-10 text-center animate-fade-in">
      <Logo size={64} className="mb-4 drop-shadow-lg" />
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight">How can I help you today?</h2>
      <p className="mt-2 max-w-md px-2 text-sm text-muted-foreground">
        Ask me about course registration, exams, the library, ICT support, hostels, fees,
        the academic calendar, or student conduct.
      </p>
      <div className="mt-6 grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
        {SAMPLE_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => onPick(q)}
            className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm shadow-sm transition-all hover:border-primary/40 hover:bg-accent hover:shadow"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
