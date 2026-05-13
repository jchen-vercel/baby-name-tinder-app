import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { RemoveLikeButton } from "@/components/remove-like-button";
import {
  ensureAppUser,
  getActiveCoupleForUser,
  getLikedNames,
} from "@/lib/data";

export default async function LikesPage() {
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

  const likedNames = await getLikedNames(
    activeCouple.couple.id,
    activeCouple.member.userId,
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-rose-500">
            Your shortlist
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
            Liked names
          </h1>
          <p className="mt-3 max-w-2xl text-slate-500">
            These are the names you liked. Remove any name to put it back into
            your swipe deck and clear it from shared matches.
          </p>
        </div>
        <Link
          href="/app"
          className="rounded-full bg-slate-950 px-5 py-3 text-center font-bold text-white transition hover:bg-slate-800"
        >
          Back to swiping
        </Link>
      </div>

      {likedNames.length === 0 ? (
        <div className="mt-10 rounded-[2rem] border border-dashed border-rose-200 bg-white/70 p-10 text-center">
          <h2 className="text-2xl font-black text-slate-950">
            No liked names yet.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            Names you like from the swipe deck will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {likedNames.map((likedName) => (
            <article
              key={likedName.id}
              className="rounded-[2rem] bg-white p-6 shadow-sm shadow-rose-100"
            >
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-rose-400">
                <span>{likedName.gender}</span>
                {likedName.popularityRank ? (
                  <span>#{likedName.popularityRank}</span>
                ) : null}
              </div>
              <h2 className="mt-8 text-4xl font-black text-slate-950">
                {likedName.name}
              </h2>
              <p className="mt-3 font-semibold text-slate-500">
                {likedName.origin ?? "Origin unknown"}
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-500">
                {likedName.meaning ?? "A name you wanted to keep around."}
              </p>
              <RemoveLikeButton
                coupleId={activeCouple.couple.id}
                babyNameId={likedName.id}
              />
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
