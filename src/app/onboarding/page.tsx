import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/onboarding-form";
import { ensureAppUser, getActiveCoupleForUser } from "@/lib/data";

export default async function OnboardingPage() {
  await auth.protect();
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const appUser = await ensureAppUser(userId);
  const activeCouple = await getActiveCoupleForUser(appUser.id);

  if (activeCouple) {
    redirect("/app");
  }

  return (
    <main className="min-h-screen px-6 py-16 md:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-mono text-xs font-medium uppercase tracking-widest text-accent">
          Two-player setup
        </p>
        <h1 className="text-gradient-display mt-4 text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
          Set up your couple
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-foreground-muted md:text-lg">
          Create an invite code or join your partner&apos;s couple. Each person
          picks mother or father so matches are easy to compare.
        </p>
      </div>
      <div className="mt-12">
        <OnboardingForm />
      </div>
    </main>
  );
}
