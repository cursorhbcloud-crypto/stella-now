import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h1 className="text-[32px] font-bold tracking-tight">없는 페이지</h1>
      <Link href="/" className="mt-6 inline-block text-sm font-medium text-violet">
        홈으로
      </Link>
    </div>
  );
}
