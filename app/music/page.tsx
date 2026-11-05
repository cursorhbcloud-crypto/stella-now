import type { Metadata } from "next";
import { getMember, shortName, unitTone } from "@/content/members";
import { tracks } from "@/content/tracks";

export const metadata: Metadata = { title: "음원 · Stella Now" };

export default function MusicPage() {
  return (
    <div>
      <h1 className="font-serif text-5xl tracking-tight">음원</h1>
      <ul className="mt-8 grid gap-3">
        {tracks.map((track) => {
          const member = getMember(track.memberSlug);
          if (!member) return null;
          const tone = unitTone[member.unit];
          return (
            <li key={track.title}>
              <a
                href={member.youtube}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 rounded-2xl border border-line bg-card px-4 py-4 shadow-[0_8px_20px_rgba(48,36,18,0.04)] hover:border-gold/50"
              >
                <span
                  className="grid size-12 shrink-0 place-items-center rounded-xl font-serif text-sm"
                  style={{ background: tone.wash, color: tone.text }}
                >
                  {shortName(member.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm">{track.title}</span>
                  <span className="mt-1 block text-xs text-muted">
                    {member.name} · {track.date}
                  </span>
                </span>
                <span className="text-sm text-gold">유튜브</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
