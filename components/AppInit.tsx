"use client";

import { useEffect } from "react";
import { useTrainerStore } from "@/lib/store";

/** Pulls server state into the store once on mount (no-op in local mode). */
export function AppInit() {
  const hydrateFromServer = useTrainerStore((s) => s.hydrateFromServer);
  useEffect(() => {
    void hydrateFromServer();
  }, [hydrateFromServer]);
  return null;
}
