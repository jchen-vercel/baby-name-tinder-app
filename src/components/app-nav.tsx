import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function AppNav() {
  return (
    <header className="border-b border-rose-100 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/app" className="text-lg font-black tracking-tight">
          Baby Name Tinder
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/app"
            className="text-sm font-bold text-slate-600 transition hover:text-rose-600"
          >
            Swipe
          </Link>
          <Link
            href="/app/likes"
            className="text-sm font-bold text-slate-600 transition hover:text-rose-600"
          >
            Likes
          </Link>
          <Link
            href="/app/matches"
            className="text-sm font-bold text-slate-600 transition hover:text-rose-600"
          >
            Matches
          </Link>
          <Link
            href="/app/settings"
            className="text-sm font-bold text-slate-600 transition hover:text-rose-600"
          >
            Settings
          </Link>
          <UserButton />
        </div>
      </nav>
    </header>
  );
}
