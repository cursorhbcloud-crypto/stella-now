"use client";

import Link from "next/link";
import { members, shortName, unitTone, units } from "@/content/members";
import { useOshi } from "@/components/oshi";

export function MemberDirectory() {
  const { slug } = useOshi();

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {units.map((unit) => {
        const tone = unitTone[unit.id];
        return (
          <section
            key={unit.id}
            className="rounded-[28px] border border-line p-4 shadow-[0_12px_30px_rgba(48,36,18,0.04)]"
            style={{ background: tone.surface }}
          >
            <h2 className="px-2 pt-1 text-sm font-medium" style={{ color: tone.text }}>
              {unit.name}
            </h2>
            <ul className="mt-3 grid gap-2">
              {members
                .filter((member) => member.unit === unit.id)
                .map((member) => {
                  const oshi = member.slug === slug;
                  return (
                    <li key={member.slug}>
                      <Link
                        href={`/members/${member.slug}`}
                        className={`flex items-center gap-3 rounded-2xl border bg-card px-3 py-3 shadow-[0_4px_12px_rgba(48,36,18,0.04)] transition-transform hover:-translate-y-0.5 ${
                          oshi ? "border-gold" : "border-white"
                        }`}
                      >
                        <span
                          className="grid size-11 shrink-0 place-items-center rounded-xl font-serif text-sm"
                          style={{ background: tone.wash, color: tone.text }}
                        >
                          {shortName(member.name)}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm">{member.name}</span>
                          <span className="block text-xs text-muted">{member.nameEn}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
