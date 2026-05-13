import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { HeroParallax } from "@/components/hero-parallax";
import { SpotlightSurface } from "@/components/spotlight-surface";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <nav className="border-b border-white/[0.06] backdrop-blur-xl">
        <div className="container mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 md:py-6">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-white"
          >
            Baby Name Tinder
          </Link>
          <Show when="signed-in">
            <div className="flex items-center gap-3 md:gap-4">
              <Link
                href="/app"
                className="btn-primary focus-ring-accent inline-flex rounded-lg px-4 py-2 text-sm font-semibold"
              >
                Open app
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 ring-1 ring-white/10",
                  },
                }}
              />
            </div>
          </Show>
          <Show when="signed-out">
            <div className="flex items-center gap-2">
              <span className="btn-secondary focus-ring-accent inline-flex rounded-lg px-4 py-2 text-sm font-semibold">
                <SignInButton mode="modal">Sign in</SignInButton>
              </span>
            </div>
          </Show>
        </div>
      </nav>

      <section className="container mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-[1.05fr_0.95fr] md:gap-16 md:py-24 lg:py-32">
        <HeroParallax className="origin-top will-change-transform">
          <p className="mb-4 font-mono text-xs font-medium uppercase tracking-widest text-foreground-muted">
            Swipe separately · match together
          </p>
          <h1 className="text-gradient-display max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.03em] md:text-6xl lg:text-7xl">
            Find the baby names{" "}
            <span className="text-gradient-accent-shimmer">you both love</span>
            .
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground-muted md:text-lg lg:text-xl">
            Create a couple, choose mother or father, and swipe through a huge
            baby-name pool. When both parents like the same name, it lands on
            your shared match list.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Show when="signed-in">
              <Link
                href="/app"
                className="btn-primary focus-ring-accent inline-flex justify-center rounded-lg px-6 py-3 text-center text-sm font-semibold"
              >
                Start swiping
              </Link>
            </Show>
            <Show when="signed-out">
              <>
                <span className="btn-primary focus-ring-accent inline-flex justify-center rounded-lg px-6 py-3 text-center text-sm font-semibold">
                  <SignInButton mode="modal">Get started</SignInButton>
                </span>
                <span className="btn-secondary focus-ring-accent inline-flex justify-center rounded-lg px-6 py-3 text-center text-sm font-semibold">
                  <SignUpButton mode="modal">Create account</SignUpButton>
                </span>
              </>
            </Show>
          </div>
        </HeroParallax>

        <div className="relative mx-auto w-full max-w-sm lg:mx-0 lg:max-w-md">
          <SpotlightSurface className="surface-card surface-card-glass rounded-2xl p-5 transition-transform duration-300 [transition-timing-function:var(--ease-expo-out)] hover:-translate-y-1">
            <div className="rounded-xl border border-border-default bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
              <p className="text-xs font-mono font-medium uppercase tracking-widest text-accent">
                Today&apos;s name
              </p>
              <h2 className="text-gradient-display mt-10 text-center text-5xl font-semibold tracking-tight md:text-6xl">
                Isla
              </h2>
              <p className="mt-4 text-center text-foreground-muted">
                Scottish origin · “island”
              </p>
              <div className="mt-12 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border-default bg-white/[0.04] py-4 text-center text-lg font-semibold text-foreground-muted shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
                  Pass
                </div>
                <div className="rounded-lg btn-primary py-4 text-center text-lg font-semibold">
                  Like
                </div>
              </div>
            </div>
          </SpotlightSurface>
        </div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <section className="container mx-auto max-w-6xl border-t border-border-default px-6 py-16 md:py-24 lg:py-32">
        <p className="font-mono text-xs font-medium uppercase tracking-widest text-foreground-muted">
          How it flows
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Built for two-player momentum
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground-muted">
          Layered glass, soft glow, and tight micro-interactions keep the
          focus on the names — not the chrome.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-6 lg:auto-rows-[minmax(168px,auto)]">
          <SpotlightSurface className="surface-card surface-card-glass rounded-2xl p-8 lg:col-span-4 lg:row-span-2">
            <h3 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
              Private swipes, public matches
            </h3>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground-muted md:text-base">
              Each parent reviews names independently. Only when both tap like
              does a name graduate to your shared shortlist — no spoilers, no
              awkward reveals mid-deck.
            </p>
          </SpotlightSurface>
          <div className="surface-card surface-card-glass rounded-2xl p-6 transition-transform duration-300 [transition-timing-function:var(--ease-expo-out)] hover:-translate-y-1 lg:col-span-2">
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              Invite code
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
              One person creates the couple; the other joins with the code.
            </p>
          </div>
          <div className="surface-card surface-card-glass rounded-2xl p-6 transition-transform duration-300 [transition-timing-function:var(--ease-expo-out)] hover:-translate-y-1 lg:col-span-2 lg:row-span-1">
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              Roles &amp; filters
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
              Pick mother/father and narrow the deck to girl, boy, or both.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border-default bg-background-deep/80 py-12 backdrop-blur-md">
        <div className="container mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 md:flex-row md:items-center">
          <p className="text-sm text-foreground-muted">
            Baby Name Tinder — cinematic swiping for two.
          </p>
          <Link
            href="/app"
            className="text-sm font-medium text-accent transition-colors hover:text-accent-bright"
          >
            Enter the app
          </Link>
        </div>
      </footer>
    </main>
  );
}
