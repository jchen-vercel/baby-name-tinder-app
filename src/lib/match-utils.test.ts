import { describe, expect, it } from "vitest";

import { shouldCreateMatch } from "./match-utils";

describe("shouldCreateMatch", () => {
  it("matches only when the current user and partner both like a name", () => {
    expect(shouldCreateMatch({ direction: "like", partnerLiked: true })).toBe(
      true,
    );
    expect(shouldCreateMatch({ direction: "like", partnerLiked: false })).toBe(
      false,
    );
    expect(shouldCreateMatch({ direction: "pass", partnerLiked: true })).toBe(
      false,
    );
  });
});
