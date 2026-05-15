"use client";

import { useEffect, useRef, useState } from "react";

type HeroParallaxProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Hero copy fades, scales, and drifts slightly on scroll (first ~50% viewport height).
 * Skips transform updates for prefers-reduced-motion and coarse pointers (touch) for reliable tap targets.
 */
export function HeroParallax({ children, className = "" }: HeroParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (typeof window === "undefined" || !ref.current) {
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (reduceMotion || coarsePointer) {
      return;
    }

    const maxScroll = window.innerHeight * 0.5;

    function update() {
      const y = window.scrollY;
      const progress = Math.min(1, Math.max(0, y / maxScroll));
      const opacity = 1 - progress;
      const scale = 1 - progress * 0.05;
      const translateY = progress * 100;
      setStyle({
        opacity,
        transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
        transition: "none",
      });
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
