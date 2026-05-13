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
        className="focus-ring-accent w-full rounded-lg border border-border-default bg-transparent px-4 py-3 text-sm font-semibold text-foreground-muted transition-colors [transition-timing-function:var(--ease-expo-out)] hover:border-border-hover hover:bg-surface hover:text-foreground disabled:cursor-not-allowed disabled:opacity-45"
      >
        {isRemoving ? "Removing..." : "Remove from likes"}
      </button>
      {error ? (
        <p className="mt-3 rounded-2xl border border-red-500/35 bg-red-950/45 px-4 py-3 text-sm font-medium text-red-100">
          {error}
        </p>
      ) : null}
    </div>
  );
}
