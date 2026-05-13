"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RemoveLikeButton({
  coupleId,
  babyNameId,
}: {
  coupleId: string;
  babyNameId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  async function removeLike() {
    setError(null);
    setIsRemoving(true);

    const response = await fetch("/api/likes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coupleId, babyNameId }),
    });

    const payload = (await response.json()) as { error?: string };
    setIsRemoving(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to remove this liked name.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={removeLike}
        disabled={isRemoving}
        className="w-full rounded-full border border-rose-200 bg-white px-4 py-3 text-sm font-black text-rose-700 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isRemoving ? "Removing..." : "Remove from likes"}
      </button>
      {error ? (
        <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
