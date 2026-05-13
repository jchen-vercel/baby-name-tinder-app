import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ensureAppUser, getActiveCoupleForUser, getMatchedNames } from "@/lib/data";

export default async function MatchesPage() {
  await auth.protect();
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const appUser = await ensureAppUser(userId);
  const activeCouple = await getActiveCoupleForUser(appUser.id);

  if (!activeCouple) {
    redirect("/onboarding");
  }

  const matches = await getMatchedNames(activeCouple.couple.id);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 md:py-14">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs font-medium uppercase tracking-widest text-accent">
            Shared likes
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Matched names
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground-muted md:text-base">
            These are the names both parents liked. Keep swiping to build the
            shortlist together.
          </p>
        </div>
        <Link
          href="/app"
          className="btn-primary focus-ring-accent inline-flex justify-center rounded-lg px-5 py-3 text-center text-sm font-semibold"
        >
          Back to swiping
        </Link>
      </div>

      {matches.length === 0 ? (
        <div className="surface-card surface-card-glass mt-10 rounded-2xl border border-dashed border-white/15 p-10 text-center">
          <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            No matches yet.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-foreground-muted">
            Once both parents like the same name, it will appear here
            automatically after a swipe.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <article
              key={match.id}
              className="surface-card surface-card-glass rounded-2xl p-6 transition-transform duration-300 [transition-timing-function:var(--ease-expo-out)] hover:-translate-y-1"
            >
              <div className="flex items-center justify-between text-xs font-mono font-medium uppercase tracking-widest text-accent">
                <span>{match.gender}</span>
                {match.popularityRank ? (
                  <span className="text-foreground-muted">
                    #{match.popularityRank}
                  </span>
                ) : null}
              </div>
              <h2 className="text-gradient-display mt-8 text-3xl font-semibold tracking-tight md:text-4xl">
                {match.name}
              </h2>
              <p className="mt-3 font-medium text-foreground-muted">
                {match.origin ?? "Origin unknown"}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-foreground-muted">
                {match.meaning ?? "A shared favorite for your shortlist."}
              </p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
