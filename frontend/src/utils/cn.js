import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge conditional + conflicting Tailwind classes (shadcn's classic helper).
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
