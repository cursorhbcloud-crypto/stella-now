import Link from "next/link";

export function SettingsButton() {
  return (
    <Link href="/settings" aria-label="설정" className="grid size-10 shrink-0 place-items-center text-ink md:hidden">
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3.6v2.1M12 18.3v2.1M4.8 6.6l1.5 1.5M17.7 15.9l1.5 1.5M3.6 12h2.1M18.3 12h2.1M4.8 17.4l1.5-1.5M17.7 8.1l1.5-1.5" />
      </svg>
    </Link>
  );
}
