"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RelikeButton({
  coupleId,
  babyNameId,
}: {
  coupleId: string;
  babyNameId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [matchMessage, setMatchMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function relike() {
    setError(null);
    setMatchMessage(null);
    setIsSubmitting(true);

    const response = await fetch("/api/swipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coupleId,
        babyNameId,
        direction: "like",
      }),
    });

    const payload = (await response.json()) as {
      error?: string;
      matched?: boolean;
      name?: string;
    };

    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to like this name.");
      return;
    }

    if (payload.matched) {
      setMatchMessage(`Match! You both liked ${payload.name ?? "this name"}.`);
    }

    router.refresh();
  }

  return (
    <div className="mt-auto w-full pt-6">
      <button
        type="button"
        onClick={() => void relike()}
        disabled={isSubmitting}
        className="btn-primary focus-ring-accent w-full rounded-lg px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45"
      >
        {isSubmitting ? "Saving..." : "Like again"}
      </button>
      {matchMessage ? (
        <p className="mt-3 rounded-2xl border border-border-accent bg-accent/10 px-4 py-3 text-sm font-medium text-foreground">
          {matchMessage}
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 rounded-2xl border border-red-500/35 bg-red-950/45 px-4 py-3 text-sm font-medium text-red-100">
          {error}
        </p>
      ) : null}
    </div>
  );
}
