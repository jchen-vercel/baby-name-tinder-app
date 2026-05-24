import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  MatchRankingControls,
  TopThreeSlots,
} from "@/components/match-ranking-controls";
import {
  ensureAppUser,
  getActiveCoupleForUser,
  getCoupleRankingContext,
  getMatchedNames,
} from "@/lib/data";

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

  const [matches, rankingContext] = await Promise.all([
    getMatchedNames(activeCouple.couple.id),
    getCoupleRankingContext(activeCouple.couple.id, appUser.id),
  ]);

  const myRankByName = new Map(
    rankingContext.myRankings.map((entry) => [entry.babyNameId, entry.rank]),
  );

  const topThreeSlots = ([1, 2, 3] as const).map((rank) => {
    const entry = rankingContext.myRankings.find((row) => row.rank === rank);
    return entry
      ? { rank, babyNameId: entry.babyNameId, name: entry.name }
      : null;
  });

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
            Pick your top 3 from shared matches. We&apos;ll highlight where you
            and your partner overlap.
          </p>
          {matches.length > 0 ? (
            <p className="mt-3 text-sm font-medium text-foreground-muted">
              Partner has picked {rankingContext.summary.partnerRankedCount}/3
            </p>
          ) : null}
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
        <>
          {rankingContext.summary.perfectPicks.length > 0 ? (
            <section className="surface-card surface-card-glass mt-10 rounded-2xl border border-border-accent bg-accent/5 p-6 md:p-8">
              <p className="font-mono text-xs font-medium uppercase tracking-widest text-accent">
                Perfect picks
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                You both ranked these #1
              </h2>
              <ul className="mt-5 space-y-2">
                {rankingContext.summary.perfectPicks.map((entry) => (
                  <li
                    key={entry.babyNameId}
                    className="text-lg font-semibold text-foreground"
                  >
                    {entry.name}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {rankingContext.summary.strongOverlaps.length > 0 ? (
            <section className="mt-8">
              <p className="font-mono text-xs font-medium uppercase tracking-widest text-accent">
                Strong overlap
              </p>
              <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
                In both of your top 3
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {rankingContext.summary.strongOverlaps.map((entry) => (
                  <span
                    key={entry.babyNameId}
                    className="rounded-full border border-border-accent bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground"
                  >
                    {entry.name}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-10">
            <p className="font-mono text-xs font-medium uppercase tracking-widest text-accent">
              Your top 3
            </p>
            <TopThreeSlots
              coupleId={activeCouple.couple.id}
              slots={topThreeSlots}
            />
          </section>

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
                <MatchRankingControls
                  coupleId={activeCouple.couple.id}
                  match={match}
                  myRank={myRankByName.get(match.id) ?? null}
                />
              </article>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
