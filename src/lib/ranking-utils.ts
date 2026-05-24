export type RankingEntry = {
  babyNameId: string;
  name: string;
  rank: number;
};

export type RankingOverlap = {
  babyNameId: string;
  name: string;
  motherRank: number | null;
  fatherRank: number | null;
  combinedScore: number | null;
  isPerfectPick: boolean;
  isStrongOverlap: boolean;
};

export type RankingSummary = {
  perfectPicks: RankingOverlap[];
  strongOverlaps: RankingOverlap[];
  partnerRankedCount: number;
};

export function buildRankingSummary({
  members,
  rankingsByUser,
  currentUserId,
}: {
  members: Array<{ userId: string; role: "mother" | "father" }>;
  rankingsByUser: Map<string, RankingEntry[]>;
  currentUserId: string;
}): RankingSummary {
  const mother = members.find((member) => member.role === "mother");
  const father = members.find((member) => member.role === "father");

  const motherRankings = mother
    ? (rankingsByUser.get(mother.userId) ?? [])
    : [];
  const fatherRankings = father
    ? (rankingsByUser.get(father.userId) ?? [])
    : [];

  const motherByName = new Map(
    motherRankings.map((entry) => [entry.babyNameId, entry.rank]),
  );
  const fatherByName = new Map(
    fatherRankings.map((entry) => [entry.babyNameId, entry.rank]),
  );

  const allNameIds = new Set([
    ...motherRankings.map((entry) => entry.babyNameId),
    ...fatherRankings.map((entry) => entry.babyNameId),
  ]);

  const nameById = new Map<string, string>();
  for (const entry of [...motherRankings, ...fatherRankings]) {
    nameById.set(entry.babyNameId, entry.name);
  }

  const overlaps: RankingOverlap[] = [...allNameIds].map((babyNameId) => {
    const motherRank = motherByName.get(babyNameId) ?? null;
    const fatherRank = fatherByName.get(babyNameId) ?? null;
    const isPerfectPick = motherRank === 1 && fatherRank === 1;
    const isStrongOverlap = motherRank != null && fatherRank != null;

    return {
      babyNameId,
      name: nameById.get(babyNameId) ?? "Unknown",
      motherRank,
      fatherRank,
      combinedScore:
        isStrongOverlap && motherRank != null && fatherRank != null
          ? motherRank + fatherRank
          : null,
      isPerfectPick,
      isStrongOverlap,
    };
  });

  const perfectPicks = overlaps
    .filter((entry) => entry.isPerfectPick)
    .sort((a, b) => a.name.localeCompare(b.name));

  const strongOverlaps = overlaps
    .filter((entry) => entry.isStrongOverlap && !entry.isPerfectPick)
    .sort((a, b) => {
      if (a.combinedScore === null || b.combinedScore === null) {
        return 0;
      }
      if (a.combinedScore !== b.combinedScore) {
        return a.combinedScore - b.combinedScore;
      }
      return a.name.localeCompare(b.name);
    });

  const partner = members.find((member) => member.userId !== currentUserId);
  const partnerRankedCount = partner
    ? (rankingsByUser.get(partner.userId)?.length ?? 0)
    : 0;

  return {
    perfectPicks,
    strongOverlaps,
    partnerRankedCount,
  };
}
