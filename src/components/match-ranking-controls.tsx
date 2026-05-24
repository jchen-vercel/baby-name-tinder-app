"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type MatchCard = {
  id: string;
  name: string;
  gender: string;
  origin: string | null;
  meaning: string | null;
  popularityRank: number | null;
};

export function MatchRankingControls({
  coupleId,
  match,
  myRank,
}: {
  coupleId: string;
  match: MatchCard;
  myRank: number | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingRank, setPendingRank] = useState<number | null>(null);

  async function assignRank(rank: 1 | 2 | 3) {
    setError(null);
    setPendingRank(rank);

    const nextRank = myRank === rank ? null : rank;

    const response = await fetch("/api/match-rankings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coupleId,
        babyNameId: match.id,
        rank: nextRank,
      }),
    });

    const payload = (await response.json()) as { error?: string };
    setPendingRank(null);

    if (!response.ok) {
      setError(payload.error ?? "Unable to update ranking.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="mt-6">
      <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-foreground-subtle">
        Your top 3
      </p>
      <div className="mt-2 flex gap-2">
        {([1, 2, 3] as const).map((rank) => {
          const isActive = myRank === rank;
          const isPending = pendingRank === rank;

          return (
            <button
              key={rank}
              type="button"
              disabled={pendingRank !== null}
              onClick={() => void assignRank(rank)}
              className={`focus-ring-accent flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors [transition-timing-function:var(--ease-expo-out)] disabled:cursor-not-allowed disabled:opacity-45 ${
                isActive
                  ? "border-border-accent bg-accent/15 text-foreground"
                  : "border-border-default bg-surface/50 text-foreground-muted hover:border-border-hover hover:text-foreground"
              }`}
            >
              {isPending ? "…" : `#${rank}`}
            </button>
          );
        })}
      </div>
      {error ? (
        <p className="mt-3 rounded-2xl border border-red-500/35 bg-red-950/45 px-4 py-3 text-sm font-medium text-red-100">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TopThreeSlots({
  coupleId,
  slots,
}: {
  coupleId: string;
  slots: Array<{ rank: number; babyNameId: string; name: string } | null>;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function clearSlot(babyNameId: string) {
    setPendingId(babyNameId);

    const response = await fetch("/api/match-rankings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coupleId,
        babyNameId,
        rank: null,
      }),
    });

    setPendingId(null);

    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-3">
      {([1, 2, 3] as const).map((rank) => {
        const slot = slots.find((entry) => entry?.rank === rank) ?? null;

        return (
          <div
            key={rank}
            className="surface-card surface-card-glass rounded-2xl border border-dashed border-white/15 p-5"
          >
            <p className="font-mono text-xs font-medium uppercase tracking-widest text-accent">
              #{rank} pick
            </p>
            {slot ? (
              <>
                <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                  {slot.name}
                </p>
                <button
                  type="button"
                  disabled={pendingId === slot.babyNameId}
                  onClick={() => void clearSlot(slot.babyNameId)}
                  className="btn-secondary focus-ring-accent mt-4 w-full rounded-lg px-3 py-2 text-sm font-semibold"
                >
                  {pendingId === slot.babyNameId ? "Clearing…" : "Clear"}
                </button>
              </>
            ) : (
              <p className="mt-4 text-sm text-foreground-muted">
                Tap #{rank} on a matched name below.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
