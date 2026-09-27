"use client";

import * as React from "react";
import { CloudOff, Cloud, Mail, LogOut, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { ModeHeader } from "@/components/shell/ModeHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { useTrainerStore } from "@/lib/store";

export default function AccountPage() {
  const configured = isSupabaseConfigured();
  const hydrateFromServer = useTrainerStore((s) => s.hydrateFromServer);

  const [email, setEmail] = React.useState("");
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!configured) return;
    const sb = getBrowserSupabase();
    sb?.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
  }, [configured]);

  async function sendLink() {
    const sb = getBrowserSupabase();
    if (!sb || !email) return;
    setBusy(true);
    setStatus(null);
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/account" },
    });
    setBusy(false);
    setStatus(error ? `錯誤：${error.message}` : "已寄出登入連結，請查收電郵。");
  }

  async function signOut() {
    const sb = getBrowserSupabase();
    await sb?.auth.signOut();
    setUserEmail(null);
    setStatus("已登出。");
  }

  return (
    <AppShell>
      <ModeHeader title="Account" subtitle="同步 · 資料" />

      {!configured ? (
        <Card>
          <CardContent className="py-6">
            <Badge variant="neutral" className="mb-3">
              <CloudOff className="h-3.5 w-3.5" /> Local mode · 本地模式
            </Badge>
            <p className="text-sm leading-relaxed text-muted-foreground">
              而家用緊本地儲存（localStorage），所有進度只留喺呢部裝置。
              設定 Supabase 之後，就會自動雲端同步、跨裝置。詳情見{" "}
              <code className="rounded bg-surface-2 px-1 py-0.5">
                docs/phase1-supabase.md
              </code>
              。
            </p>
          </CardContent>
        </Card>
      ) : userEmail ? (
        <Card>
          <CardContent className="py-6">
            <Badge variant="success" className="mb-3">
              <Cloud className="h-3.5 w-3.5" /> 已同步
            </Badge>
            <p className="mb-4 text-sm">
              登入身份：<span className="font-medium">{userEmail}</span>
            </p>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  setBusy(true);
                  await hydrateFromServer();
                  setBusy(false);
                  setStatus("已從雲端更新。");
                }}
                disabled={busy}
              >
                <RefreshCw className="h-4 w-4" /> 立即同步
              </Button>
              <Button variant="ghost" onClick={signOut}>
                <LogOut className="h-4 w-4" /> 登出
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-6">
            <Badge variant="warning" className="mb-3">
              <Mail className="h-3.5 w-3.5" /> 未登入
            </Badge>
            <p className="mb-3 text-sm text-muted-foreground">
              輸入電郵，我哋會寄一條登入連結畀你（唔使密碼）。
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mb-3 w-full rounded-[var(--radius-app)] border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
            />
            <Button size="block" onClick={sendLink} disabled={busy || !email}>
              <Mail className="h-4 w-4" /> 寄登入連結
            </Button>
          </CardContent>
        </Card>
      )}

      {status ? (
        <p className="mt-4 text-center text-sm text-muted-foreground">{status}</p>
      ) : null}
    </AppShell>
  );
}
