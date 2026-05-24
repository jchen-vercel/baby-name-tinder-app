"use client";

import confetti from "canvas-confetti";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

export type MatchCelebrationName = {
  id: string;
  name: string;
  gender: "girl" | "boy" | "neutral" | "unknown";
  origin: string | null;
  meaning: string | null;
  popularityRank: number | null;
};

function playMatchChime() {
  if (typeof window === "undefined" || document.hidden) {
    return;
  }

  const AudioContextClass =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextClass) {
    return;
  }

  try {
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    gain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.6);

    const osc2 = ctx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(659.25, now + 0.08);
    osc2.connect(gain);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.65);

    void ctx.resume().catch(() => undefined);
    window.setTimeout(() => void ctx.close(), 800);
  } catch {
    // Silent mode or unsupported audio — skip.
  }
}

function fireConfetti(reducedMotion: boolean) {
  if (reducedMotion || typeof window === "undefined") {
    return;
  }

  const duration = 700;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors: ["#5E6AD2", "#818cf8", "#EDEDEF"],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors: ["#5E6AD2", "#818cf8", "#EDEDEF"],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}

export function MatchCelebration({
  name,
  onDismiss,
}: {
  name: MatchCelebrationName;
  onDismiss: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const dismissButtonRef = useRef<HTMLButtonElement>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) {
      return;
    }
    firedRef.current = true;

    fireConfetti(Boolean(reducedMotion));
    if (!reducedMotion) {
      playMatchChime();
    }

    dismissButtonRef.current?.focus();

    const timer = window.setTimeout(onDismiss, 3500);
    return () => window.clearTimeout(timer);
  }, [onDismiss, reducedMotion]);

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onDismiss();
      }
    },
    [onDismiss],
  );

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-celebration-title"
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={handleBackdropClick}
      >
        <motion.div
          className="surface-card surface-card-glass w-full max-w-md rounded-2xl p-8 text-center shadow-[0_0_80px_rgba(94,106,210,0.25)]"
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-mono text-xs font-medium uppercase tracking-widest text-accent">
            It&apos;s a match
          </p>
          <h2
            id="match-celebration-title"
            className="text-gradient-display mt-4 text-4xl font-semibold tracking-tight md:text-5xl"
          >
            {name.name}
          </h2>
          <p className="mt-3 text-sm text-foreground-muted">
            You both liked this name — it&apos;s on your shared shortlist.
          </p>

          <div className="mt-6 flex items-center justify-between text-xs font-mono font-medium uppercase tracking-widest text-accent">
            <span>{name.gender}</span>
            {name.popularityRank ? (
              <span className="text-foreground-muted">#{name.popularityRank}</span>
            ) : null}
          </div>
          <p className="mt-4 font-medium text-foreground-muted">
            {name.origin ?? "Origin unknown"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
            {name.meaning ?? "A shared favorite for your shortlist."}
          </p>

          <button
            ref={dismissButtonRef}
            type="button"
            onClick={onDismiss}
            className="btn-primary focus-ring-accent mt-8 w-full rounded-lg px-6 py-3 text-sm font-semibold"
          >
            Continue swiping
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
