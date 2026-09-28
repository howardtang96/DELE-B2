import { AppShell } from "@/components/shell/AppShell";
import { ModeHeader } from "@/components/shell/ModeHeader";

/** Stable placeholder shown on the server + first client render (before mount). */
export function PracticeLoading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <AppShell>
      <ModeHeader title={title} subtitle={subtitle} />
      <div className="space-y-3">
        <div className="h-6 w-3/4 animate-pulse rounded bg-surface-2" />
        <div className="h-14 animate-pulse rounded-[var(--radius-app)] bg-surface-2" />
        <div className="h-14 animate-pulse rounded-[var(--radius-app)] bg-surface-2" />
        <div className="h-14 animate-pulse rounded-[var(--radius-app)] bg-surface-2" />
      </div>
    </AppShell>
  );
}
