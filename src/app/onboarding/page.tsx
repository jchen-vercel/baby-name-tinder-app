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
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-rose-500">
          Two-player setup
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
          Set up your couple
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Create an invite code or join your partner&apos;s couple. Each person
          picks mother or father so matches are easy to compare.
        </p>
      </div>
      <div className="mt-10">
        <OnboardingForm />
      </div>
    </main>
  );
}
