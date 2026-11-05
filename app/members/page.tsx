import Link from "next/link";
import { members, shortName, unitName } from "@/content/members";

export const metadata = { title: "멤버 · Stella Now" };

export default function MembersPage() {
  return (
    <div>
      <h1 className="text-[32px] font-bold tracking-tight">멤버</h1>
      <ul className="mt-6 divide-y divide-line border-y border-line md:grid md:grid-cols-2 md:gap-x-12 md:divide-y-0 md:border-0">
        {members.map((member) => (
          <li key={member.slug} className="md:border-b md:border-line">
            <Link href={`/members/${member.slug}`} className="flex items-center gap-3 py-3.5">
              <span className="grid size-11 place-items-center rounded-full bg-[#f3f0ff] text-sm font-medium text-violet">
                {shortName(member.name)}
              </span>
              <span>
                <span className="block text-[15px] font-medium">{member.name}</span>
                <span className="block text-xs text-muted">{unitName(member.unit)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
