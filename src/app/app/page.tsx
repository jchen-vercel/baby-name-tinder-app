import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SwipeDeck } from "@/components/swipe-deck";
import { ensureAppUser, getActiveCoupleForUser, getSwipeDeck } from "@/lib/data";

export default async function SwipePage() {
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

  const names = await getSwipeDeck(
    activeCouple.couple.id,
    activeCouple.member.userId,
    activeCouple.member.namePreference,
  );

  return (
    <main className="px-6 py-8">
      <div className="mx-auto mb-8 flex max-w-6xl flex-col gap-4 rounded-[2rem] bg-white p-6 shadow-sm shadow-rose-100 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-rose-500">
            {activeCouple.member.role} mode · {activeCouple.member.namePreference} names
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Swipe your shortlist
          </h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            Your swipes stay private. A name appears in matches only when both
            parents like it.
          </p>
        </div>
        <div className="rounded-3xl bg-rose-50 px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400">
            Invite code
          </p>
          <p className="mt-1 text-2xl font-black tracking-[0.2em] text-rose-700">
            {activeCouple.couple.inviteCode}
          </p>
        </div>
      </div>

      <SwipeDeck coupleId={activeCouple.couple.id} initialNames={names} />

      <div className="mt-8 text-center">
        <Link
          href="/app/matches"
          className="font-bold text-rose-700 transition hover:text-rose-900"
        >
          View matched names
        </Link>
      </div>
    </main>
  );
}
