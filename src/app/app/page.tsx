import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { InviteSharePanel } from "@/components/invite-share-panel";
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
    <main className="px-6 py-8 md:py-12">
      <div className="surface-card surface-card-glass mx-auto mb-10 flex max-w-6xl flex-col gap-6 rounded-2xl p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <p className="font-mono text-xs font-medium uppercase tracking-widest text-accent">
            {activeCouple.member.role} mode ·{" "}
            {activeCouple.member.namePreference} names
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Swipe your shortlist
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground-muted md:text-base">
            Your swipes stay private. A name appears in matches only when both
            parents like it.
          </p>
        </div>
        <InviteSharePanel inviteCode={activeCouple.couple.inviteCode} />
      </div>

      <SwipeDeck coupleId={activeCouple.couple.id} initialNames={names} />

      <div className="mt-10 text-center">
        <Link
          href="/app/matches"
          className="text-sm font-medium text-accent transition-colors [transition-timing-function:var(--ease-expo-out)] hover:text-accent-bright"
        >
          View matched names
        </Link>
      </div>
    </main>
  );
}
