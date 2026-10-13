"use client";

import { useSyncExternalStore } from "react";

export function useMedia(query: string, serverValue = false) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

export const useIsDesktop = () => useMedia("(min-width: 1024px)");
