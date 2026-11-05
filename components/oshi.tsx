"use client";

import { useEffect, useState } from "react";

const KEY = "stella-now-oshi";

export function useOshi() {
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    setSlug(window.localStorage.getItem(KEY));
  }, []);

  function choose(next: string) {
    window.localStorage.setItem(KEY, next);
    setSlug(next);
  }

  function clear() {
    window.localStorage.removeItem(KEY);
    setSlug(null);
  }

  return { slug, choose, clear };
}
