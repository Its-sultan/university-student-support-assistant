import { useEffect } from "react";
import { LuTriangleAlert } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

// A modal confirmation dialog (alert dialog).
// Render it always; control visibility with `open`.
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default", // "default" | "destructive"
  onConfirm,
  onCancel,
}) {
  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onCancel?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onCancel}
      />
      {/* Dialog */}
      <div
        role="alertdialog"
        aria-modal="true"
        className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl animate-fade-in"
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              variant === "destructive"
                ? "bg-destructive/10 text-destructive"
                : "bg-accent text-accent-foreground"
            )}
          >
            <LuTriangleAlert size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            size="sm"
            onClick={onConfirm}
            autoFocus
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
