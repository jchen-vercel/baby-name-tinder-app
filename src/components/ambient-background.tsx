/**
 * Full-viewport layered background: base radial gradient, noise, animated blobs, grid.
 * Fixed behind content; keep `relative z-10` (or isolation) on foreground sections as needed.
 */
export function AmbientBackground() {
  const noiseSvg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <filter id="n">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#n)" opacity="0.55"/>
    </svg>`,
  );

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      {/* Layer 1 — base depth gradient */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0a0a0f_0%,#050506_50%,#020203_100%)]"
      />

      {/* Layer 2 — film grain / noise */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,${noiseSvg}")`,
          backgroundRepeat: "repeat",
          backgroundSize: "120px 120px",
        }}
      />

      {/* Layer 3 — ambient blobs */}
      <div className="absolute -top-[20%] left-1/2 h-[1400px] w-[900px] -translate-x-1/2 rounded-full bg-[#5E6AD2]/25 blur-[150px] animate-blob-float" />
      <div className="absolute -left-[10%] top-[15%] h-[800px] w-[600px] rounded-full bg-[#7c3aed]/15 blur-[120px] animate-blob-float-alt" />
      <div className="absolute -right-[8%] top-[25%] h-[700px] w-[500px] rounded-full bg-[#4f46e5]/12 blur-[100px] animate-blob-float" />
      <div className="absolute bottom-[-15%] left-1/3 h-[500px] w-[800px] rounded-full bg-[#5E6AD2]/10 blur-[130px] animate-blob-pulse" />

      {/* Layer 4 — 64px grid */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.9) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.9) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  );
}
