"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { flushSync } from "react-dom";

import { SpotlightSurface } from "@/components/spotlight-surface";
import {
  MatchCelebration,
  type MatchCelebrationName,
} from "@/components/match-celebration";

/** Drag distance ( px ) past this on release counts as a swipe. */
const SWIPE_OFFSET_PX = 100;
/** Fast horizontal flick ( px/s ) can complete a swipe before the offset threshold. */
const SWIPE_VELOCITY_PX_S = 520;

type SwipeDirection = "like" | "pass";

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

/** Shared card chrome so the front, under-card, and exit clone keep the same silhouette. */
const CARD_SHELL_CLASS =
  "relative z-10 flex min-h-[320px] w-full flex-col rounded-2xl border border-white/[0.1] bg-[linear-gradient(168deg,#191923_0%,#121218_42%,#0c0c10_100%)] p-8 shadow-[0_10px_44px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.07),inset_0_1px_0_0_rgba(255,255,255,0.08)] sm:min-h-[340px]";

const CARD_FRONT_CLASS = `${CARD_SHELL_CLASS} cursor-grab touch-none transition-[box-shadow] duration-300 [transition-timing-function:var(--ease-expo-out)] active:cursor-grabbing hover:shadow-[0_14px_48px_rgba(0,0,0,0.58),0_0_0_1px_rgba(255,255,255,0.1),0_0_80px_rgba(94,106,210,0.08),inset_0_1px_0_0_rgba(255,255,255,0.1)]`;

/** Same layout as the front; only depth cue is slight dimming (no inset/scale — avoids the “pop” when promoted). */
const CARD_UNDER_CLASS = `${CARD_SHELL_CLASS} brightness-[0.97]`;

type ExitFlight = {
  key: string;
  name: SwipeDeckName;
  direction: SwipeDirection;
  /** Motion value of the real card when a drag committed (button commits use 0). */
  initialX: number;
};

function initialRotateFromDragX(x: number) {
  const clamped = Math.max(-280, Math.min(280, x));
  return (clamped / 280) * 17;
}

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

function DeckThirdPeek() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-[26px] bottom-0 top-0 z-[6] rounded-2xl border border-white/[0.05] bg-[#0c0c0d] opacity-[0.92] shadow-[var(--shadow-card)]"
    />
  );
}

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

/** Next name in the stack — full width, same shell as front (no narrower inset / scale animation). */
function DeckStackNextCard({ name }: { name: SwipeDeckName }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 top-0 z-[8] flex flex-col"
    >
      <div className="mt-2.5 min-h-0 flex-1">
        <SpotlightSurface className={CARD_UNDER_CLASS}>
          <NameCardBody name={name} />
        </SpotlightSurface>
      </div>
    </div>
  );
}

/**
 * Cloned card that keeps flying after the real deck has already advanced — allows instant
 * interaction with the next name while this finishes visually.
 */
function FlyingExitCard({
  name,
  direction,
  initialX,
  onDone,
}: {
  name: SwipeDeckName;
  direction: SwipeDirection;
  initialX: number;
  onDone: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();

  const springExit = useMemo(
    () =>
      prefersReducedMotion
        ? {
            type: "tween" as const,
            duration: 0.32,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
          }
        : {
            type: "spring" as const,
            stiffness: 96,
            damping: 22,
            mass: 0.92,
            restDelta: 0.8,
          },
    [prefersReducedMotion],
  );

  const vw =
    typeof window !== "undefined" ? window.innerWidth : 420;
  const targetX = direction === "like" ? vw * 1.45 : -vw * 1.45;
  const targetRot = direction === "like" ? 16 : -16;
  const startRot = initialRotateFromDragX(initialX);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[50] flex flex-col"
      initial={{ x: initialX, rotate: startRot }}
      animate={{ x: targetX, rotate: targetRot }}
      transition={springExit}
      onAnimationComplete={onDone}
      style={{ transformOrigin: "50% 50%" }}
    >
      <div className="relative mt-2.5 min-h-0 w-full flex-1">
        <SpotlightSurface className={CARD_FRONT_CLASS}>
          <NameCardBody name={name} />
        </SpotlightSurface>
      </div>
    </motion.div>
  );
}

function SwipeableFrontCard({
  name,
  onCommittedSwipe,
}: {
  name: SwipeDeckName;
  /** Invoked as soon as a swipe counts — parent advances deck + spawns exit clone. */
  onCommittedSwipe: (direction: SwipeDirection, dragX: number) => void;
}) {
  const x = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion();

  const rotate = useTransform(x, [-280, 0, 280], [-17, 0, 17]);
  const scale = useTransform(x, [-200, 0, 200], [0.985, 1, 0.985]);

  const likeStampOpacity = useTransform(
    x,
    [0, SWIPE_OFFSET_PX * 1.25],
    [0, 1],
    { clamp: true },
  );
  const nopeStampOpacity = useTransform(
    x,
    [-SWIPE_OFFSET_PX * 1.25, 0],
    [1, 0],
    { clamp: true },
  );

  const springReturn = useMemo(
    () =>
      prefersReducedMotion
        ? { type: "tween" as const, duration: 0.15, ease: "easeOut" as const }
        : {
            type: "spring" as const,
            stiffness: 400,
            damping: 34,
            mass: 0.82,
          },
    [prefersReducedMotion],
  );

  const onDragEnd = useCallback(
    async (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const ox = info.offset.x;
      const vx = info.velocity.x;
      const at = x.get();

      if (ox > SWIPE_OFFSET_PX || vx > SWIPE_VELOCITY_PX_S) {
        onCommittedSwipe("like", at);
        return;
      }
      if (ox < -SWIPE_OFFSET_PX || vx < -SWIPE_VELOCITY_PX_S) {
        onCommittedSwipe("pass", at);
        return;
      }

      await animate(x, 0, springReturn);
    },
    [onCommittedSwipe, springReturn, x],
  );

  return (
    <motion.div
      className="relative z-10 mt-2.5 w-full"
      style={{ x, rotate, scale }}
      drag="x"
      dragDirectionLock
      dragMomentum={false}
      dragElastic={0.06}
      onDragEnd={onDragEnd}
      whileTap={{ cursor: "grabbing" }}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-lg border-4 border-red-400 px-3 py-2 text-2xl font-black uppercase italic tracking-tight text-red-400/95 shadow-[0_0_24px_rgba(0,0,0,0.5)] [transform:rotate(-12deg)]"
        style={{ opacity: nopeStampOpacity }}
      >
        Nope
      </motion.div>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-lg border-4 border-emerald-400 px-3 py-2 text-2xl font-black uppercase italic tracking-tight text-emerald-400/95 shadow-[0_0_24px_rgba(0,0,0,0.5)] [transform:rotate(12deg)]"
        style={{ opacity: likeStampOpacity }}
      >
        Like
      </motion.div>
      <SpotlightSurface className={CARD_FRONT_CLASS}>
        <NameCardBody name={name} />
      </SpotlightSurface>
    </motion.div>
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
  const [matchedName, setMatchedName] = useState<MatchCelebrationName | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [exitFlights, setExitFlights] = useState<ExitFlight[]>([]);

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
      const existingIds = new Set(existingNames.map((n) => n.id));
      const freshNames = (payload.names ?? []).filter(
        (n) => !existingIds.has(n.id),
      );

      return [...existingNames, ...freshNames];
    });
  }, [isLoadingMore]);

  const persistSwipeInBackground = useCallback(
    async (
      swipedName: SwipeDeckName,
      direction: SwipeDirection,
      deckLengthBeforeSwipe: number,
    ) => {
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
        setMatchedName(swipedName);
      }

      if (deckLengthBeforeSwipe <= 4) {
        void loadMore();
      }
    },
    [coupleId, loadMore],
  );

  /**
   * Advances the deck immediately and plays the outgoing swipe on a decorative clone.
   * The real front card is the next name right away — no waiting for the spring to settle.
   */
  const commitSwipeNow = useCallback(
    (direction: SwipeDirection, dragX: number) => {
      let swiped: SwipeDeckName | undefined;
      let deckLen = 0;

      flushSync(() => {
        setError(null);
        setMatchedName(null);
        setNames((existingNames) => {
          swiped = existingNames[0];
          deckLen = existingNames.length;
          if (!swiped) {
            return existingNames;
          }
          return existingNames.slice(1);
        });
      });

      if (!swiped) {
        return;
      }

      const removed = swiped;
      const key = `${removed.id}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setExitFlights((f) => [
        ...f,
        { key, name: removed, direction, initialX: dragX },
      ]);
      void persistSwipeInBackground(removed, direction, deckLen);
    },
    [persistSwipeInBackground],
  );

  const swipe = useCallback(
    (direction: SwipeDirection) => {
      commitSwipeNow(direction, 0);
    },
    [commitSwipeNow],
  );

  const removeExitFlight = useCallback((key: string) => {
    setExitFlights((f) => f.filter((e) => e.key !== key));
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat) {
        return;
      }
      if (event.key === "ArrowLeft") {
        swipe("pass");
      }

      if (event.key === "ArrowRight") {
        swipe("like");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [swipe]);

  const actionsLocked = !currentName;

  return (
    <section className="mx-auto w-full max-w-md">
      {matchedName ? (
        <MatchCelebration
          name={matchedName}
          onDismiss={() => setMatchedName(null)}
        />
      ) : null}

      <div className="mb-4 flex items-center justify-between px-2 text-sm font-medium text-[#aeb3be]">
        <span className="drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
          {remainingLabel}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-widest text-[#9ea4b0]">
          ← Pass · Like →
        </span>
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-red-500/35 bg-red-950/45 px-5 py-4 text-sm font-medium text-red-100">
          {error}
        </div>
      ) : null}

      <div className="relative min-h-[340px] w-full select-none overflow-hidden rounded-2xl sm:min-h-[360px]">
        {currentName ? (
          <>
            {names.length >= 3 ? <DeckThirdPeek /> : null}
            {names[1] ? (
              <DeckStackNextCard key={names[1].id} name={names[1]} />
            ) : (
              <DeckStackBackLayers />
            )}
            <SwipeableFrontCard
              key={currentName.id}
              name={currentName}
              onCommittedSwipe={commitSwipeNow}
            />
            {exitFlights.map((flight) => (
              <FlyingExitCard
                key={flight.key}
                name={flight.name}
                direction={flight.direction}
                initialX={flight.initialX}
                onDone={() => removeExitFlight(flight.key)}
              />
            ))}
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
          disabled={actionsLocked}
          className="btn-secondary focus-ring-accent rounded-lg px-6 py-4 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-45"
        >
          Pass
        </button>
        <button
          type="button"
          onClick={() => swipe("like")}
          disabled={actionsLocked}
          className="btn-primary focus-ring-accent rounded-lg px-6 py-4 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-45"
        >
          Like
        </button>
      </div>
    </section>
  );
}