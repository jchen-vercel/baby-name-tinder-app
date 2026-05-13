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
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-rose-500">
            Shared likes
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
            Matched names
          </h1>
          <p className="mt-3 max-w-2xl text-slate-500">
            These are the names both parents liked. Keep swiping to build the
            shortlist together.
          </p>
        </div>
        <Link
          href="/app"
          className="rounded-full bg-slate-950 px-5 py-3 text-center font-bold text-white transition hover:bg-slate-800"
        >
          Back to swiping
        </Link>
      </div>

      {matches.length === 0 ? (
        <div className="mt-10 rounded-[2rem] border border-dashed border-rose-200 bg-white/70 p-10 text-center">
          <h2 className="text-2xl font-black text-slate-950">
            No matches yet.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            Once both parents like the same name, it will appear here
            automatically after a swipe.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <article
              key={match.id}
              className="rounded-[2rem] bg-white p-6 shadow-sm shadow-rose-100"
            >
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-rose-400">
                <span>{match.gender}</span>
                {match.popularityRank ? (
                  <span>#{match.popularityRank}</span>
                ) : null}
              </div>
              <h2 className="mt-8 text-4xl font-black text-slate-950">
                {match.name}
              </h2>
              <p className="mt-3 font-semibold text-slate-500">
                {match.origin ?? "Origin unknown"}
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-500">
                {match.meaning ?? "A shared favorite for your shortlist."}
              </p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
