"use client";

import { useCallback, useEffect, useState } from "react";

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

  return (
    <section className="mx-auto w-full max-w-md">
      <div className="mb-4 flex items-center justify-between px-2 text-sm font-bold text-slate-500">
        <span>{remainingLabel}</span>
        <span>Use left/right keys</span>
      </div>

      {matchName ? (
        <div className="mb-4 rounded-3xl bg-rose-600 px-5 py-4 text-center font-black text-white shadow-lg shadow-rose-200">
          Match! You both liked {matchName}.
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-3xl bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      <div className="relative h-[520px]">
        {names.slice(0, 3).map((name, index) => (
          <article
            key={name.id}
            className="absolute inset-0 rounded-[2rem] border border-rose-100 bg-white p-8 shadow-2xl shadow-rose-100 transition"
            style={{
              transform: `translateY(${index * 14}px) scale(${1 - index * 0.04})`,
              zIndex: 10 - index,
            }}
          >
            <div className="flex items-center justify-between text-sm font-bold uppercase tracking-[0.2em] text-rose-400">
              <span>{name.gender}</span>
              {name.popularityRank ? <span>#{name.popularityRank}</span> : null}
            </div>
            <div className="flex h-full flex-col items-center justify-center pb-16 text-center">
              <h2 className="text-6xl font-black tracking-tight text-slate-950">
                {name.name}
              </h2>
              <p className="mt-5 text-lg font-semibold text-slate-500">
                {name.origin ?? "Origin unknown"}
              </p>
              <p className="mt-4 max-w-xs text-base leading-7 text-slate-500">
                {name.meaning ?? "A beautiful name to consider together."}
              </p>
            </div>
          </article>
        ))}

        {!currentName ? (
          <div className="flex h-full flex-col items-center justify-center rounded-[2rem] border border-dashed border-rose-200 bg-white/70 p-8 text-center">
            <h2 className="text-3xl font-black text-slate-950">
              You reached the end.
            </h2>
            <p className="mt-3 text-slate-500">
              Add more names to the seed dataset and run the seed script to keep
              swiping.
            </p>
            <button
              type="button"
              onClick={loadMore}
              className="mt-6 rounded-full bg-slate-950 px-5 py-3 font-bold text-white"
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
          className="rounded-full bg-white px-6 py-4 text-lg font-black text-slate-700 shadow-lg shadow-rose-100 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Pass
        </button>
        <button
          type="button"
          onClick={() => swipe("like")}
          disabled={!currentName}
          className="rounded-full bg-rose-600 px-6 py-4 text-lg font-black text-white shadow-lg shadow-rose-200 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Like
        </button>
      </div>
    </section>
  );
}
