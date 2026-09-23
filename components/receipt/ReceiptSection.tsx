import * as React from "react";
import { cn } from "@/lib/utils";

/** One block of the Learning Receipt. Numbered, icon, calm. */
export function ReceiptSection({
  n,
  title,
  icon: Icon,
  children,
  className,
}: {
  n: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex gap-3", className)}>
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="mt-1 w-px flex-1 bg-border" aria-hidden />
      </div>
      <div className="flex-1 pb-6">
        <h2 className="mb-1.5 text-sm font-semibold">
          <span className="text-muted-foreground">{n}. </span>
          {title}
        </h2>
        <div className="text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
      </div>
    </section>
  );
}
