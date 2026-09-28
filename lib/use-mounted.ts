"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * false during SSR and the first client render, true after mount. Lets a component
 * defer client-only content (e.g. sessions built from persisted state) so server and
 * client render the same thing first — avoiding hydration mismatches. No setState.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
