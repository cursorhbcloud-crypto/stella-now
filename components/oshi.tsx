"use client";

import { useEffect, useState } from "react";

const KEY = "stella-now-oshi";
const ALERT_KEY = "stella-now-oshi-alert";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function storedSlug() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(KEY);
}

function storedAlert() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ALERT_KEY) === "1";
}

export function useOshi() {
  const [ready, setReady] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setReady(true);
    const update = () => setVersion((current) => current + 1);
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  const slug = ready ? storedSlug() : null;
  const alert = ready ? storedAlert() : false;
  void version;

  function choose(next: string) {
    window.localStorage.setItem(KEY, next);
    emit();
  }

  function clear() {
    window.localStorage.removeItem(KEY);
    window.localStorage.removeItem(ALERT_KEY);
    emit();
  }

  async function setAlerts(on: boolean) {
    if (!on) {
      window.localStorage.removeItem(ALERT_KEY);
      emit();
      return;
    }
    if (!storedSlug()) return;
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch {
        // The in-app notice still works when the device blocks notifications.
      }
    }
    window.localStorage.setItem(ALERT_KEY, "1");
    emit();
  }

  return { slug, alert, choose, clear, setAlerts };
}
