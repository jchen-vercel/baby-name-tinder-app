"use client";

import { useCallback, useEffect, useState } from "react";

import { SpotlightSurface } from "@/components/spotlight-surface";

type SwipeDeckName = {
  id: string;
  name: string;
  gender: "girl" | "boy" | "neutral" | "unknown";
  origin: string | null;
  meaning: string | null;
  popularityRank: number | null;
};

type SwipeResponse = {
  matched: boolean;
  name?: string;
  error?: string;
};

function NameCardBody({ name }: { name: SwipeDeckName }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between text-xs font-mono font-medium uppercase tracking-widest text-indigo-200/95">
        <span className="drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)]">
          {name.gender}
        </span>
        {name.popularityRank ? (
          <span className="text-[#c5c9d4] drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">
            #{name.popularityRank}
          </span>
        ) : null}
      </div>
      {/* Flow from the top — avoids the huge “void” caused by h-full + justify-center */}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-start gap-5 pb-5 pt-10 text-center">
        <h2 className="text-gradient-display text-5xl font-semibold tracking-tight drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] md:text-6xl">
          {name.name}
        </h2>
        <p className="text-lg font-medium text-[#d8dce6]">
          {name.origin ?? "Origin unknown"}
        </p>
        <p className="max-w-xs text-base leading-relaxed text-[#b4bac8]">
          {name.meaning ?? "A beautiful name to consider together."}
        </p>
      </div>
    </div>
  );
}

/** Two static layers behind the front card — same bottom edge, narrow inset, ~10px peek at top. */
function DeckStackBackLayers() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[14px] bottom-0 top-0 z-[7] rounded-2xl border border-white/[0.06] bg-[linear-gradient(180deg,#15151c_0%,#0a0a0d_100%)] shadow-[var(--shadow-card)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[26px] bottom-0 top-0 z-[6] rounded-2xl border border-white/[0.05] bg-[#0c0c0d] opacity-[0.92] shadow-[var(--shadow-card)]"
      />
    </>
  );
}

export function SwipeDeck({
  coupleId,
  initialNames,
}: {
  coupleId: string;
  initialNames: SwipeDeckName[];
}) {
  const [names, setNames] = useState(initialNames);
  const [matchName, setMatchName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const currentName = names[0];

  const remainingLabel =
    names.length === 0
      ? "No names left in this deck"
      : `${names.length} ready to review`;

  const loadMore = useCallback(async () => {
    if (isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    const response = await fetch("/api/swipes", { method: "GET" });
    const payload = (await response.json()) as {
      names?: SwipeDeckName[];
      error?: string;
    };
    setIsLoadingMore(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to load more names.");
      return;
    }

    setNames((existingNames) => {
      const existingIds = new Set(existingNames.map((name) => name.id));
      const freshNames = (payload.names ?? []).filter(
        (name) => !existingIds.has(name.id),
      );

      return [...existingNames, ...freshNames];
    });
  }, [isLoadingMore]);

  const swipe = useCallback(
    async (direction: "like" | "pass") => {
      if (!currentName) {
        return;
      }

      const swipedName = currentName;
      setError(null);
      setMatchName(null);
      setNames((existingNames) => existingNames.slice(1));

      const response = await fetch("/api/swipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coupleId,
          babyNameId: swipedName.id,
          direction,
        }),
      });

      const payload = (await response.json()) as SwipeResponse;

      if (!response.ok) {
        setError(payload.error ?? "Unable to save that swipe.");
        setNames((existingNames) => [swipedName, ...existingNames]);
        return;
      }

      if (payload.matched) {
        setMatchName(payload.name ?? swipedName.name);
      }

      if (names.length <= 4) {
        void loadMore();
      }
    },
    [coupleId, currentName, loadMore, names.length],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        void swipe("pass");
      }

      if (event.key === "ArrowRight") {
        void swipe("like");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [swipe]);

  const frontCardClass =
    "relative z-10 mt-2.5 flex min-h-[320px] w-full flex-col rounded-2xl border border-white/[0.1] bg-[linear-gradient(168deg,#191923_0%,#121218_42%,#0c0c10_100%)] p-8 shadow-[0_10px_44px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.07),inset_0_1px_0_0_rgba(255,255,255,0.08)] transition-[transform,box-shadow] duration-300 [transition-timing-function:var(--ease-expo-out)] hover:shadow-[0_14px_48px_rgba(0,0,0,0.58),0_0_0_1px_rgba(255,255,255,0.1),0_0_80px_rgba(94,106,210,0.08),inset_0_1px_0_0_rgba(255,255,255,0.1)] sm:min-h-[340px]";

  return (
    <section className="mx-auto w-full max-w-md">
      <div className="mb-4 flex items-center justify-between px-2 text-sm font-medium text-[#aeb3be]">
        <span className="drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
          {remainingLabel}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-widest text-[#9ea4b0]">
          ← Pass · Like →
        </span>
      </div>

      {matchName ? (
        <div className="mb-4 rounded-2xl border border-border-accent bg-accent/10 px-5 py-4 text-center font-semibold text-foreground shadow-[0_0_40px_rgba(94,106,210,0.12)]">
          Match! You both liked {matchName}.
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-2xl border border-red-500/35 bg-red-950/45 px-5 py-4 text-sm font-medium text-red-100">
          {error}
        </div>
      ) : null}

      <div className="relative min-h-[340px] w-full overflow-hidden rounded-2xl sm:min-h-[360px]">
        {names.length > 0 ? (
          <>
            <DeckStackBackLayers />
            <SpotlightSurface key={names[0].id} className={frontCardClass}>
              <NameCardBody name={names[0]} />
            </SpotlightSurface>
          </>
        ) : null}

        {!currentName ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-surface/60 p-8 text-center backdrop-blur-sm sm:min-h-[340px]">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              You reached the end.
            </h2>
            <p className="mt-3 text-foreground-muted">
              Add more names to the seed dataset and run the seed script to keep
              swiping.
            </p>
            <button
              type="button"
              onClick={loadMore}
              className="btn-primary focus-ring-accent mt-6 rounded-lg px-5 py-3 text-sm font-semibold"
            >
              Check for more
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => swipe("pass")}
          disabled={!currentName}
          className="btn-secondary focus-ring-accent rounded-lg px-6 py-4 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-45"
        >
          Pass
        </button>
        <button
          type="button"
          onClick={() => swipe("like")}
          disabled={!currentName}
          className="btn-primary focus-ring-accent rounded-lg px-6 py-4 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-45"
        >
          Like
        </button>
      </div>
    </section>
  );
}
