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
      className="rounded-[2rem] bg-white p-6 shadow-sm shadow-rose-100"
    >
      <fieldset>
        <legend className="text-sm font-bold uppercase tracking-[0.2em] text-rose-500">
          Name gender preference
        </legend>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {preferenceOptions.map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer rounded-3xl border p-5 transition ${
                namePreference === option.value
                  ? "border-rose-500 bg-rose-50"
                  : "border-slate-200 bg-white hover:border-rose-200"
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
              <span className="text-lg font-black text-slate-950">
                {option.title}
              </span>
              <span className="mt-2 block text-sm leading-6 text-slate-500">
                {option.description}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {status ? (
        <p className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {status}
        </p>
      ) : null}

      {error ? (
        <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSaving || namePreference === initialPreference}
        className="mt-8 rounded-full bg-rose-600 px-6 py-4 font-black text-white shadow-lg shadow-rose-200 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
      >
        {isSaving ? "Saving..." : "Save preference"}
      </button>
    </form>
  );
}
