"use client";

import { useEffect, useState } from "react";

const cache = new Map<string, Promise<unknown>>();

/** Loads one of the static JSON files in /public/data once per page session. */
export function loadJson<T>(url: string): Promise<T> {
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url).then((r) => {
        if (!r.ok) throw new Error(`${url}: ${r.status}`);
        return r.json();
      }),
    );
  }
  return cache.get(url) as Promise<T>;
}

export function useJson<T>(url: string | null) {
  const [state, setState] = useState<{ url: string | null; data: T | null; error: boolean }>({ url: null, data: null, error: false });
  useEffect(() => {
    if (!url) return;
    let alive = true;
    loadJson<T>(url)
      .then((data) => alive && setState({ url, data, error: false }))
      .catch(() => alive && setState({ url, data: null, error: true }));
    return () => {
      alive = false;
    };
  }, [url]);
  // never hand back data that belongs to a previous url
  const fresh = state.url === url;
  return { data: fresh ? state.data : null, loading: !!url && !fresh, error: fresh && state.error };
}
