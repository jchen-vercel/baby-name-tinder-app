"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/app", label: "Swipe" },
  { href: "/app/likes", label: "Likes" },
  { href: "/app/passed", label: "Passed" },
  { href: "/app/matches", label: "Matches" },
  { href: "/app/settings", label: "Settings" },
] as const;

function MenuIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden
      >
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    );
  }

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function AppNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative sticky top-0 z-50 border-b border-border-default bg-background-base/80 backdrop-blur-xl">
      <nav className="container relative mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/app"
          className="text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-white"
        >
          Baby Name Tinder
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-foreground-muted transition-colors [transition-timing-function:var(--ease-expo-out)] hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9 ring-1 ring-white/10",
              },
            }}
          />
        </div>

        <button
          type="button"
          className="focus-ring-accent inline-flex items-center justify-center rounded-lg border border-border-default bg-surface p-2 text-foreground md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-app-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          <MenuIcon open={menuOpen} />
        </button>
      </nav>

      <div
        id="mobile-app-nav"
        className={`absolute left-0 right-0 top-full origin-top border-b border-border-default bg-background-base/95 shadow-[0_24px_48px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-[opacity,transform,visibility] duration-200 [transition-timing-function:var(--ease-expo-out)] md:hidden ${
          menuOpen
            ? "pointer-events-auto visible translate-y-0 opacity-100"
            : "pointer-events-none invisible -translate-y-2 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-1 px-4 py-4">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors [transition-timing-function:var(--ease-expo-out)] hover:bg-surface hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-3 flex justify-between gap-3 border-t border-border-default pt-4">
            <span className="text-xs font-mono uppercase tracking-widest text-foreground-muted">
              Account
            </span>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 ring-1 ring-white/10",
                },
              }}
            />
          </div>
          <Link
            href="/app"
            className="btn-primary focus-ring-accent mt-4 w-full rounded-lg py-3 text-center text-sm font-semibold"
            onClick={() => setMenuOpen(false)}
          >
            Back to swiping
          </Link>
        </div>
      </div>
    </header>
  );
}
