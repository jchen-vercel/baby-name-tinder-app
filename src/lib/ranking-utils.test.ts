import { describe, expect, it } from "vitest";

import { buildRankingSummary } from "./ranking-utils";

describe("buildRankingSummary", () => {
  const members = [
    { userId: "mother-id", role: "mother" as const },
    { userId: "father-id", role: "father" as const },
  ];

  it("detects perfect picks when both parents rank a name #1", () => {
    const rankingsByUser = new Map([
      [
        "mother-id",
        [
          { babyNameId: "a", name: "Emma", rank: 1 },
          { babyNameId: "b", name: "Liam", rank: 2 },
        ],
      ],
      [
        "father-id",
        [
          { babyNameId: "a", name: "Emma", rank: 1 },
          { babyNameId: "c", name: "Noah", rank: 2 },
        ],
      ],
    ]);

    const summary = buildRankingSummary({
      members,
      rankingsByUser,
      currentUserId: "mother-id",
    });

    expect(summary.perfectPicks).toHaveLength(1);
    expect(summary.perfectPicks[0]?.name).toBe("Emma");
  });

  it("sorts strong overlaps by combined rank score", () => {
    const rankingsByUser = new Map([
      [
        "mother-id",
        [
          { babyNameId: "a", name: "Emma", rank: 2 },
          { babyNameId: "b", name: "Liam", rank: 1 },
        ],
      ],
      [
        "father-id",
        [
          { babyNameId: "a", name: "Emma", rank: 3 },
          { babyNameId: "b", name: "Liam", rank: 2 },
        ],
      ],
    ]);

    const summary = buildRankingSummary({
      members,
      rankingsByUser,
      currentUserId: "mother-id",
    });

    expect(summary.strongOverlaps.map((entry) => entry.name)).toEqual([
      "Liam",
      "Emma",
    ]);
    expect(summary.strongOverlaps[0]?.combinedScore).toBe(3);
  });

  it("reports partner ranked count without revealing names", () => {
    const rankingsByUser = new Map([
      ["mother-id", [{ babyNameId: "a", name: "Emma", rank: 1 }]],
      [
        "father-id",
        [
          { babyNameId: "b", name: "Liam", rank: 1 },
          { babyNameId: "c", name: "Noah", rank: 2 },
        ],
      ],
    ]);

    const summary = buildRankingSummary({
      members,
      rankingsByUser,
      currentUserId: "mother-id",
    });

    expect(summary.partnerRankedCount).toBe(2);
  });
});
