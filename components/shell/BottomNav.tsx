"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, Headphones, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Today", icon: Home, enabled: true },
  { href: "/progress", label: "Progress", icon: BarChart3, enabled: true },
  { href: "/listening", label: "Listen", icon: Headphones, enabled: true },
  { href: "/sprint", label: "Speak", icon: Mic, enabled: false },
];

/** Hub-level bottom navigation. Only shown on hub screens (Today, Progress). */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-[430px] items-stretch justify-around px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {items.map(({ href, label, icon: Icon, enabled }) => {
          const active = pathname === href;
          return enabled ? (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-xs font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ) : (
            <span
              key={href}
              aria-disabled
              title="Coming soon"
              className="flex flex-1 flex-col items-center gap-1 py-1.5 text-xs font-medium text-muted-foreground/40"
            >
              <Icon className="h-5 w-5" />
              {label}
            </span>
          );
        })}
      </div>
    </nav>
  );
}
