"use client";

import { useState, useCallback } from "react";
import type { BabyName } from "@/data/names";
import { babyNames } from "@/data/names";
import NameCard from "./NameCard";

export default function SwipeDeck() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<BabyName[]>([]);
  const [showResults, setShowResults] = useState(false);

  const remaining = babyNames.slice(currentIndex);
  const isFinished = currentIndex >= babyNames.length;

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      if (isFinished) return;
      const current = babyNames[currentIndex];
      if (direction === "right") {
        setLiked((prev) => [...prev, current]);
      }
      setCurrentIndex((prev) => prev + 1);
    },
    [currentIndex, isFinished]
  );

  const handleReset = useCallback(() => {
    setCurrentIndex(0);
    setLiked([]);
    setShowResults(false);
  }, []);

  if (showResults || isFinished) {
    return (
      <div className="flex flex-col items-center w-full max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Your Favorites
        </h2>
        {liked.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            No names liked yet. Try again!
          </p>
        ) : (
          <ul className="w-full space-y-3 mb-6">
            {liked.map((n) => (
              <li
                key={n.name}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/70 dark:bg-white/10 shadow-sm"
              >
                <span className="font-semibold text-lg text-gray-900 dark:text-white">
                  {n.name}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {n.origin}
                </span>
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={handleReset}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* Card stack */}
      <div className="relative w-full max-w-sm h-80 mb-8">
        {remaining
          .slice(0, 3)
          .reverse()
          .map((name, i) => {
            const offset = remaining.slice(0, 3).length - 1 - i;
            return (
              <NameCard
                key={name.name}
                name={name}
                offset={offset}
                isTop={offset === 0}
              />
            );
          })}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => handleSwipe("left")}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-lg border-2 border-red-200 dark:border-red-800 text-red-500 text-2xl hover:scale-110 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
          aria-label="Dislike"
        >
          ✕
        </button>
        <button
          onClick={() => setShowResults(true)}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-400 text-sm hover:scale-105 transition-all"
          aria-label="View results"
        >
          ★
        </button>
        <button
          onClick={() => handleSwipe("right")}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-lg border-2 border-green-200 dark:border-green-800 text-green-500 text-2xl hover:scale-110 hover:bg-green-50 dark:hover:bg-green-900/30 transition-all"
          aria-label="Like"
        >
          ♥
        </button>
      </div>

      {/* Progress */}
      <p className="mt-6 text-sm text-gray-400 dark:text-gray-500">
        {currentIndex + 1} / {babyNames.length}
      </p>
    </div>
  );
}
