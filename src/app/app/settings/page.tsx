import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { NamePreferenceForm } from "@/components/name-preference-form";
import { ensureAppUser, getActiveCoupleForUser } from "@/lib/data";

export default async function SettingsPage() {
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

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 md:py-14">
      <div className="mb-10">
        <p className="font-mono text-xs font-medium uppercase tracking-widest text-accent">
          Account settings
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Preferences
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground-muted md:text-base">
          Choose which names appear in your swipe deck. This setting only
          affects your account in the current couple.
        </p>
      </div>

      <NamePreferenceForm
        initialPreference={activeCouple.member.namePreference}
      />
    </main>
  );
}
