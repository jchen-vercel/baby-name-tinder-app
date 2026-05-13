"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { NamePreference, ParentRole } from "@/db/schema";

type Mode = "create" | "join";

export function OnboardingForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("create");
  const [role, setRole] = useState<ParentRole>("mother");
  const [namePreference, setNamePreference] =
    useState<NamePreference>("girl");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await fetch("/api/couples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        mode === "create"
          ? { action: "create", role, namePreference }
          : { action: "join", role, namePreference, inviteCode },
      ),
    });

    const payload = (await response.json()) as { error?: string };

    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to continue.");
      return;
    }

    router.push("/app");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-xl shadow-rose-100"
    >
      <div className="grid grid-cols-2 gap-2 rounded-full bg-rose-50 p-1">
        {(["create", "join"] as const).map((option) => (
          <button
            type="button"
            key={option}
            onClick={() => setMode(option)}
            className={`rounded-full px-4 py-3 text-sm font-bold capitalize transition ${
              mode === option
                ? "bg-white text-rose-700 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {option} couple
          </button>
        ))}
      </div>

      <fieldset className="mt-8">
        <legend className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
          Your role
        </legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {(["mother", "father"] as const).map((option) => (
            <label
              key={option}
              className={`cursor-pointer rounded-3xl border p-5 transition ${
                role === option
                  ? "border-rose-500 bg-rose-50"
                  : "border-slate-200 bg-white hover:border-rose-200"
              }`}
            >
              <input
                type="radio"
                name="role"
                value={option}
                checked={role === option}
                onChange={() => setRole(option)}
                className="sr-only"
              />
              <span className="text-lg font-black capitalize text-slate-950">
                {option}
              </span>
              <span className="mt-2 block text-sm leading-6 text-slate-500">
                You will swipe privately and only shared likes become matches.
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-8">
        <legend className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
          Show me
        </legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {(["girl", "boy", "both"] as const).map((option) => (
            <label
              key={option}
              className={`cursor-pointer rounded-3xl border p-5 transition ${
                namePreference === option
                  ? "border-rose-500 bg-rose-50"
                  : "border-slate-200 bg-white hover:border-rose-200"
              }`}
            >
              <input
                type="radio"
                name="namePreference"
                value={option}
                checked={namePreference === option}
                onChange={() => setNamePreference(option)}
                className="sr-only"
              />
              <span className="text-lg font-black capitalize text-slate-950">
                {option === "both" ? "Both" : `${option} names`}
              </span>
              <span className="mt-2 block text-sm leading-6 text-slate-500">
                {option === "both"
                  ? "Your deck will include boy and girl names."
                  : `Your deck will only show ${option} names.`}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {mode === "join" ? (
        <label className="mt-6 block">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
            Invite code
          </span>
          <input
            value={inviteCode}
            onChange={(event) => setInviteCode(event.target.value)}
            placeholder="ABC123"
            className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg font-bold uppercase tracking-[0.2em] outline-none transition focus:border-rose-500"
            required
          />
        </label>
      ) : null}

      {error ? (
        <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-8 w-full rounded-full bg-rose-600 px-6 py-4 font-black text-white shadow-lg shadow-rose-200 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
      >
        {isSubmitting
          ? "Saving..."
          : mode === "create"
            ? "Create couple"
            : "Join couple"}
      </button>
    </form>
  );
}
