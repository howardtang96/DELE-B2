"use client";

import * as React from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/lib/use-mounted";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

/** Discoverable install entry: native prompt on Android/desktop, guided steps on iOS. */
export function InstallButton() {
  const mounted = useMounted();
  const [deferred, setDeferred] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [iosHelp, setIosHelp] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferred(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!mounted || dismissed || isStandalone()) return null;

  const ios = isIOS();
  // Nothing to offer: not iOS and no native prompt captured yet.
  if (!deferred && !ios) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  return (
    <Card className="mb-4 border-primary/30 bg-primary/5">
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">安裝落主畫面</p>
              <p className="text-xs text-muted-foreground">似 app 咁用 · 全螢幕 · 離線都開到</p>
            </div>
          </div>
          <button
            aria-label="Dismiss"
            onClick={() => setDismissed(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {deferred ? (
          <Button size="block" className="mt-3" onClick={install}>
            <Download className="h-4 w-4" /> 安裝 App
          </Button>
        ) : (
          <>
            <Button
              size="block"
              variant="outline"
              className="mt-3"
              onClick={() => setIosHelp((v) => !v)}
            >
              點樣喺 iPhone 安裝?
            </Button>
            {iosHelp ? (
              <ol className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">1.</span>
                  用 <span className="font-medium text-foreground">Safari</span> 開呢個網頁
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">2.</span>
                  撳底部 <Share className="h-4 w-4" /> 分享掣
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">3.</span>
                  揀 <SquarePlus className="h-4 w-4" /> 加入主畫面
                </li>
              </ol>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
