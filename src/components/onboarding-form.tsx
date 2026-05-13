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
      className="surface-card surface-card-glass mx-auto w-full max-w-xl rounded-2xl p-6 md:p-8"
    >
      <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/[0.08] bg-surface p-1">
        {(["create", "join"] as const).map((option) => (
          <button
            type="button"
            key={option}
            onClick={() => setMode(option)}
            className={`focus-ring-accent rounded-md px-4 py-3 text-sm font-semibold capitalize transition-colors [transition-timing-function:var(--ease-expo-out)] ${
              mode === option
                ? "bg-white/[0.08] text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            {option} couple
          </button>
        ))}
      </div>

      <fieldset className="mt-8">
        <legend className="font-mono text-xs font-medium uppercase tracking-widest text-foreground-subtle">
          Your role
        </legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {(["mother", "father"] as const).map((option) => (
            <label
              key={option}
              className={`cursor-pointer rounded-2xl border p-5 transition-colors [transition-timing-function:var(--ease-expo-out)] ${
                role === option
                  ? "border-border-accent bg-accent/10 shadow-[0_0_24px_rgba(94,106,210,0.12)]"
                  : "border-border-default bg-surface/50 hover:border-border-hover"
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
              <span className="text-lg font-semibold capitalize text-foreground">
                {option}
              </span>
              <span className="mt-2 block text-sm leading-relaxed text-foreground-muted">
                You will swipe privately and only shared likes become matches.
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-8">
        <legend className="font-mono text-xs font-medium uppercase tracking-widest text-foreground-subtle">
          Show me
        </legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {(["girl", "boy", "both"] as const).map((option) => (
            <label
              key={option}
              className={`cursor-pointer rounded-2xl border p-5 transition-colors [transition-timing-function:var(--ease-expo-out)] ${
                namePreference === option
                  ? "border-border-accent bg-accent/10 shadow-[0_0_24px_rgba(94,106,210,0.12)]"
                  : "border-border-default bg-surface/50 hover:border-border-hover"
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
              <span className="text-lg font-semibold capitalize text-foreground">
                {option === "both" ? "Both" : `${option} names`}
              </span>
              <span className="mt-2 block text-sm leading-relaxed text-foreground-muted">
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
          <span className="font-mono text-xs font-medium uppercase tracking-widest text-foreground-subtle">
            Invite code
          </span>
          <input
            value={inviteCode}
            onChange={(event) => setInviteCode(event.target.value)}
            placeholder="ABC123"
            className="input-dark focus-ring-accent mt-3 w-full px-4 py-4 text-lg font-semibold uppercase tracking-[0.14em]"
            required
          />
        </label>
      ) : null}

      {error ? (
        <p className="mt-6 rounded-2xl border border-red-500/35 bg-red-950/45 px-4 py-3 text-sm font-medium text-red-100">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary focus-ring-accent mt-8 w-full rounded-lg px-6 py-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45"
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
