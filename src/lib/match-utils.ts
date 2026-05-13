import type { SwipeDirection } from "@/db/schema";

export function shouldCreateMatch({
  direction,
  partnerLiked,
}: {
  direction: SwipeDirection;
  partnerLiked: boolean;
}) {
  return direction === "like" && partnerLiked;
}
