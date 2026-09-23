"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Progressive-disclosure note. Concise Cantonese explanation behind a tap. */
export function CantoneseNote({
  label = "點解？(廣東話解釋)",
  children,
  defaultOpen = false,
}: {
  label?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="rounded-[var(--radius-app)] border border-border bg-surface-2">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium"
      >
        <span>{label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <div className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
      ) : null}
    </div>
  );
}
