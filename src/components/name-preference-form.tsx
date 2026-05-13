"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { NamePreference } from "@/db/schema";

const preferenceOptions = [
  {
    value: "girl",
    title: "Girl names",
    description: "Only show girl names in your swipe deck.",
  },
  {
    value: "boy",
    title: "Boy names",
    description: "Only show boy names in your swipe deck.",
  },
  {
    value: "both",
    title: "Both",
    description: "Show both boy and girl names in your swipe deck.",
  },
] as const satisfies ReadonlyArray<{
  value: NamePreference;
  title: string;
  description: string;
}>;

export function NamePreferenceForm({
  initialPreference,
}: {
  initialPreference: NamePreference;
}) {
  const router = useRouter();
  const [namePreference, setNamePreference] =
    useState<NamePreference>(initialPreference);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function savePreference(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setError(null);
    setIsSaving(true);

    const response = await fetch("/api/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ namePreference }),
    });

    const payload = (await response.json()) as {
      error?: string;
      namePreference?: NamePreference;
    };

    setIsSaving(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to update your preference.");
      return;
    }

    setNamePreference(payload.namePreference ?? namePreference);
    setStatus("Preference saved. Your next deck refresh will use it.");
    router.refresh();
  }

  return (
    <form
      onSubmit={savePreference}
      className="surface-card surface-card-glass rounded-2xl p-6 md:p-8"
    >
      <fieldset>
        <legend className="font-mono text-xs font-medium uppercase tracking-widest text-accent">
          Name gender preference
        </legend>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {preferenceOptions.map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer rounded-2xl border p-5 transition-colors [transition-timing-function:var(--ease-expo-out)] ${
                namePreference === option.value
                  ? "border-border-accent bg-accent/10 shadow-[0_0_24px_rgba(94,106,210,0.12)]"
                  : "border-border-default bg-surface/50 hover:border-border-hover"
              }`}
            >
              <input
                type="radio"
                name="namePreference"
                value={option.value}
                checked={namePreference === option.value}
                onChange={() => setNamePreference(option.value)}
                className="sr-only"
              />
              <span className="text-lg font-semibold text-foreground">
                {option.title}
              </span>
              <span className="mt-2 block text-sm leading-relaxed text-foreground-muted">
                {option.description}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {status ? (
        <p className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 px-4 py-3 text-sm font-medium text-emerald-100">
          {status}
        </p>
      ) : null}

      {error ? (
        <p className="mt-6 rounded-2xl border border-red-500/35 bg-red-950/45 px-4 py-3 text-sm font-medium text-red-100">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSaving || namePreference === initialPreference}
        className="btn-primary focus-ring-accent mt-8 rounded-lg px-6 py-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45"
      >
        {isSaving ? "Saving..." : "Save preference"}
      </button>
    </form>
  );
}
