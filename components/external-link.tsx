"use client";

import type { MouseEvent, ReactNode } from "react";

export function ExternalLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={(event) => void keepPage(event, href)}>
      {children}
    </a>
  );
}

async function keepPage(event: MouseEvent<HTMLAnchorElement>, href: string) {
  const { Capacitor } = await import("@capacitor/core");
  if (!Capacitor.isNativePlatform()) return;
  event.preventDefault();
  const { Browser } = await import("@capacitor/browser");
  await Browser.open({ url: href });
}
