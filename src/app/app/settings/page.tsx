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
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-rose-500">
          Account settings
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
          Preferences
        </h1>
        <p className="mt-3 max-w-2xl text-slate-500">
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
