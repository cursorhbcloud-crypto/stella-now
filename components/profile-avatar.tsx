import profiles from "@/content/chzzk-profiles.json";

const images = profiles as Record<string, string>;

export function ProfileAvatar({ slug, className = "size-14" }: { slug: string; className?: string }) {
  const src = images[slug];

  return (
    <span className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-violet text-white ${className}`}>
      {src ? (
        // Chzzk profile photos are hosted on Naver's image CDN.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        <svg viewBox="0 0 24 24" className="size-7" fill="currentColor" aria-hidden>
          <circle cx="12" cy="8.2" r="3.3" />
          <path d="M5.4 19.4c.8-3.3 3.3-5.1 6.6-5.1s5.8 1.8 6.6 5.1v.6H5.4z" />
        </svg>
      )}
    </span>
  );
}
