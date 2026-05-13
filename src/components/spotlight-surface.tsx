"use client";

import { useCallback, useRef, useState } from "react";

type SpotlightSurfaceProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Spotlight diameter in CSS px (default matches design prompt ~300px). */
  spotlightSize?: number;
};

/**
 * Soft radial glow that follows the pointer for a “magical” card feel.
 */
export function SpotlightSurface({
  children,
  className = "",
  style,
  spotlightSize = 300,
}: SpotlightSurfaceProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const el = rootRef.current;
      if (!el) {
        return;
      }
      const rect = el.getBoundingClientRect();
      setPos({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    },
    [],
  );

  return (
    <div
      ref={rootRef}
      className={`relative overflow-hidden ${className}`}
      style={style}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      onPointerMove={onPointerMove}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out"
        style={{
          opacity: active ? 1 : 0,
          background: `radial-gradient(${spotlightSize}px circle at ${pos.x}px ${pos.y}px, rgba(94,106,210,0.15), transparent 72%)`,
        }}
      />
      <div className="relative z-10 flex h-full min-h-0 flex-col">
        {children}
      </div>
    </div>
  );
}
