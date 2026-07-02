import { useState } from "react";
import { LuThumbsUp, LuThumbsDown, LuMeh, LuCheck } from "react-icons/lu";
import { feedbackService } from "@/services/feedbackService";
import { cn } from "@/utils/cn";

// Bonus E: rate an answer Good / Average / Poor. Saved to the backend feedback file.
const OPTIONS = [
  { rating: "Good", icon: LuThumbsUp },
  { rating: "Average", icon: LuMeh },
  { rating: "Poor", icon: LuThumbsDown },
];

export default function AnswerRating({ question, answer }) {
  const [chosen, setChosen] = useState(null);

  if (chosen) {
    return (
      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
        <LuCheck size={13} className="text-primary" /> Thanks — rated “{chosen}”.
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-xs text-muted-foreground">Rate this answer:</span>
      {OPTIONS.map(({ rating, icon: Icon }) => (
        <button
          key={rating}
          onClick={() => {
            feedbackService.send(question, answer, rating);
            setChosen(rating);
          }}
          title={rating}
          className={cn(
            "flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground",
            "transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Icon size={13} /> {rating}
        </button>
      ))}
    </div>
  );
}
