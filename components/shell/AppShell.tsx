import * as React from "react";
import { cn } from "@/lib/utils";

/** Centered, phone-width column with safe-area padding. */
export function AppShell({
  children,
  className,
  withBottomNavSpace = false,
}: {
  children: React.ReactNode;
  className?: string;
  withBottomNavSpace?: boolean;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
      <main
        className={cn(
          "flex-1 px-4 pt-[max(1rem,env(safe-area-inset-top))]",
          withBottomNavSpace ? "pb-28" : "pb-8",
          className,
        )}
      >
        {children}
      </main>
    </div>
  );
}
