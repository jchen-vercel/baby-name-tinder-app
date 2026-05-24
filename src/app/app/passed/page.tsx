import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { RelikeButton } from "@/components/relike-button";
import {
  ensureAppUser,
  getActiveCoupleForUser,
  getPassedNames,
} from "@/lib/data";

export default async function PassedPage() {
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

  const passedNames = await getPassedNames(
    activeCouple.couple.id,
    activeCouple.member.userId,
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 md:py-14">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs font-medium uppercase tracking-widest text-accent">
            Second look
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Passed names
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground-muted md:text-base">
            Names you passed on. Like any name again to add it back to your
            shortlist or create a shared match.
          </p>
        </div>
        <Link
          href="/app"
          className="btn-primary focus-ring-accent inline-flex justify-center rounded-lg px-5 py-3 text-center text-sm font-semibold"
        >
          Back to swiping
        </Link>
      </div>

      {passedNames.length === 0 ? (
        <div className="surface-card surface-card-glass mt-10 rounded-2xl border border-dashed border-white/15 p-10 text-center">
          <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            No passed names yet.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-foreground-muted">
            Names you pass in the swipe deck will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {passedNames.map((passedName) => (
            <article
              key={passedName.id}
              className="surface-card surface-card-glass rounded-2xl p-6 transition-transform duration-300 [transition-timing-function:var(--ease-expo-out)] hover:-translate-y-1"
            >
              <div className="flex items-center justify-between text-xs font-mono font-medium uppercase tracking-widest text-accent">
                <span>{passedName.gender}</span>
                {passedName.popularityRank ? (
                  <span className="text-foreground-muted">
                    #{passedName.popularityRank}
                  </span>
                ) : null}
              </div>
              <h2 className="text-gradient-display mt-8 text-3xl font-semibold tracking-tight md:text-4xl">
                {passedName.name}
              </h2>
              <p className="mt-3 font-medium text-foreground-muted">
                {passedName.origin ?? "Origin unknown"}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-foreground-muted">
                {passedName.meaning ?? "A name you skipped earlier."}
              </p>
              <RelikeButton
                coupleId={activeCouple.couple.id}
                babyNameId={passedName.id}
              />
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
