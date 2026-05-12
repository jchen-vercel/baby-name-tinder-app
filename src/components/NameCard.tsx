"use client";

import type { BabyName } from "@/data/names";

const genderColors: Record<BabyName["gender"], { bg: string; badge: string; text: string }> = {
  girl: { bg: "from-pink-100 to-rose-200 dark:from-pink-900/40 dark:to-rose-900/40", badge: "bg-pink-200 text-pink-800 dark:bg-pink-800 dark:text-pink-200", text: "Girl" },
  boy: { bg: "from-blue-100 to-indigo-200 dark:from-blue-900/40 dark:to-indigo-900/40", badge: "bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200", text: "Boy" },
  neutral: { bg: "from-purple-100 to-violet-200 dark:from-purple-900/40 dark:to-violet-900/40", badge: "bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200", text: "Neutral" },
};

interface NameCardProps {
  name: BabyName;
  offset?: number;
  isTop?: boolean;
}

export default function NameCard({ name, offset = 0, isTop = false }: NameCardProps) {
  const colors = genderColors[name.gender];
  const scale = 1 - offset * 0.04;
  const translateY = offset * 8;

  return (
    <div
      className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${colors.bg} shadow-xl border border-white/50 dark:border-white/10 flex flex-col items-center justify-center p-8 ${isTop ? "cursor-grab active:cursor-grabbing" : ""}`}
      style={{
        transform: `scale(${scale}) translateY(${translateY}px)`,
        zIndex: 10 - offset,
        opacity: offset > 2 ? 0 : 1,
      }}
    >
      <span className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4 ${colors.badge}`}>
        {colors.text}
      </span>
      <h2 className="text-5xl font-bold mb-3 text-gray-900 dark:text-white">{name.name}</h2>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-1">{name.origin}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 italic">&ldquo;{name.meaning}&rdquo;</p>
    </div>
  );
}
