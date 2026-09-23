"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Full-screen mode header: close (X), title, and step dots. Hides bottom nav. */
export function ModeHeader({
  title,
  subtitle,
  step,
  total,
  onClose,
}: {
  title: string;
  subtitle?: string;
  step?: number; // 1-based current step
  total?: number;
  onClose?: () => void;
}) {
  const router = useRouter();
  const close = onClose ?? (() => router.push("/"));

  return (
    <header className="mb-5 flex items-start gap-3 pt-2">
      <button
        aria-label="Close"
        onClick={close}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-foreground transition-colors hover:opacity-90"
      >
        <X className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold leading-tight">{title}</h1>
        {subtitle ? (
          <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {total && total > 0 ? (
        <div className="mt-1 flex items-center gap-1.5" aria-label={`Step ${step} of ${total}`}>
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                step && i < step ? "bg-primary" : "bg-surface-2",
              )}
            />
          ))}
        </div>
      ) : null}
    </header>
  );
}
