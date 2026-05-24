import "server-only";

import { and, asc, desc, eq, inArray, ne, notExists } from "drizzle-orm";

import { getDb } from "@/db";
import {
  babyNames,
  coupleMembers,
  couples,
  matchRankings,
  matches,
  swipes,
  users,
  type NamePreference,
  type ParentRole,
  type SwipeDirection,
} from "@/db/schema";
import { createInviteCode } from "@/lib/invite-codes";
import { buildRankingSummary, type RankingEntry } from "@/lib/ranking-utils";
import { shouldCreateMatch } from "@/lib/match-utils";

const deckGenders = {
  boy: ["boy"],
  girl: ["girl"],
  both: ["boy", "girl"],
} as const satisfies Record<NamePreference, ReadonlyArray<"boy" | "girl">>;

async function deleteMatchRankingsForName(coupleId: string, babyNameId: string) {
  await getDb()
    .delete(matchRankings)
    .where(
      and(
        eq(matchRankings.coupleId, coupleId),
        eq(matchRankings.babyNameId, babyNameId),
      ),
    );
}

export async function ensureAppUser(clerkUserId: string) {
  const [appUser] = await getDb()
    .insert(users)
    .values({
      clerkUserId,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: users.clerkUserId,
      set: { updatedAt: new Date() },
    })
    .returning();

  return appUser;
}

export async function getActiveCoupleForUser(userId: string) {
  const [activeCouple] = await getDb()
    .select({ couple: couples, member: coupleMembers })
    .from(coupleMembers)
    .innerJoin(couples, eq(couples.id, coupleMembers.coupleId))
    .where(
      and(
        eq(coupleMembers.userId, userId),
        eq(coupleMembers.isActive, true),
        eq(couples.status, "active"),
      ),
    )
    .limit(1);

  return activeCouple ?? null;
}

export async function createCoupleForUser(
  userId: string,
  role: ParentRole,
  namePreference: NamePreference,
) {
  const existingCouple = await getActiveCoupleForUser(userId);

  if (existingCouple) {
    return existingCouple;
  }

  for (let attempts = 0; attempts < 5; attempts += 1) {
    const inviteCode = createInviteCode();

    try {
      const [couple] = await getDb()
        .insert(couples)
        .values({ inviteCode })
        .returning();

      const [member] = await getDb()
        .insert(coupleMembers)
        .values({ coupleId: couple.id, userId, role, namePreference })
        .returning();

      return { couple, member };
    } catch (error) {
      if (attempts === 4) {
        throw error;
      }
    }
  }

  throw new Error("Unable to create invite code.");
}

export async function joinCoupleForUser(
  userId: string,
  role: ParentRole,
  namePreference: NamePreference,
  inviteCode: string,
) {
  const existingCouple = await getActiveCoupleForUser(userId);

  if (existingCouple) {
    return existingCouple;
  }

  const [couple] = await getDb()
    .select()
    .from(couples)
    .where(
      and(
        eq(couples.inviteCode, inviteCode.trim().toUpperCase()),
        eq(couples.status, "active"),
      ),
    )
    .limit(1);

  if (!couple) {
    throw new Error("That invite code does not match an active couple.");
  }

  const [roleTaken] = await getDb()
    .select({ id: coupleMembers.id })
    .from(coupleMembers)
    .where(
      and(
        eq(coupleMembers.coupleId, couple.id),
        eq(coupleMembers.role, role),
        eq(coupleMembers.isActive, true),
      ),
    )
    .limit(1);

  if (roleTaken) {
    throw new Error(`This couple already has a ${role}.`);
  }

  const [member] = await getDb()
    .insert(coupleMembers)
    .values({ coupleId: couple.id, userId, role, namePreference })
    .returning();

  return { couple, member };
}

export async function getSwipeDeck(
  coupleId: string,
  userId: string,
  namePreference: NamePreference,
  limit = 20,
) {
  return getDb()
    .select({
      id: babyNames.id,
      name: babyNames.name,
      gender: babyNames.gender,
      origin: babyNames.origin,
      meaning: babyNames.meaning,
      popularityRank: babyNames.popularityRank,
    })
    .from(babyNames)
    .where(
      and(
        inArray(babyNames.gender, deckGenders[namePreference]),
        notExists(
          getDb()
            .select({ id: swipes.id })
            .from(swipes)
            .where(
              and(
                eq(swipes.coupleId, coupleId),
                eq(swipes.userId, userId),
                eq(swipes.babyNameId, babyNames.id),
              ),
            ),
        ),
      ),
    )
    .orderBy(asc(babyNames.popularityRank), asc(babyNames.name))
    .limit(limit);
}

export async function updateNamePreference(
  userId: string,
  namePreference: NamePreference,
) {
  const [member] = await getDb()
    .update(coupleMembers)
    .set({ namePreference })
    .where(
      and(eq(coupleMembers.userId, userId), eq(coupleMembers.isActive, true)),
    )
    .returning();

  if (!member) {
    throw new Error("You need an active couple before changing preferences.");
  }

  return member;
}

export async function getLikedNames(coupleId: string, userId: string) {
  return getDb()
    .select({
      id: babyNames.id,
      name: babyNames.name,
      gender: babyNames.gender,
      origin: babyNames.origin,
      meaning: babyNames.meaning,
      popularityRank: babyNames.popularityRank,
      likedAt: swipes.updatedAt,
    })
    .from(swipes)
    .innerJoin(babyNames, eq(babyNames.id, swipes.babyNameId))
    .where(
      and(
        eq(swipes.coupleId, coupleId),
        eq(swipes.userId, userId),
        eq(swipes.direction, "like"),
      ),
    )
    .orderBy(desc(swipes.updatedAt), asc(babyNames.name));
}

export async function getPassedNames(coupleId: string, userId: string) {
  return getDb()
    .select({
      id: babyNames.id,
      name: babyNames.name,
      gender: babyNames.gender,
      origin: babyNames.origin,
      meaning: babyNames.meaning,
      popularityRank: babyNames.popularityRank,
      passedAt: swipes.updatedAt,
    })
    .from(swipes)
    .innerJoin(babyNames, eq(babyNames.id, swipes.babyNameId))
    .where(
      and(
        eq(swipes.coupleId, coupleId),
        eq(swipes.userId, userId),
        eq(swipes.direction, "pass"),
      ),
    )
    .orderBy(desc(swipes.updatedAt), asc(babyNames.name));
}

export async function removeLikedName({
  coupleId,
  userId,
  babyNameId,
}: {
  coupleId: string;
  userId: string;
  babyNameId: string;
}) {
  const [membership] = await getDb()
    .select({ id: coupleMembers.id })
    .from(coupleMembers)
    .where(
      and(
        eq(coupleMembers.coupleId, coupleId),
        eq(coupleMembers.userId, userId),
        eq(coupleMembers.isActive, true),
      ),
    )
    .limit(1);

  if (!membership) {
    throw new Error("You are not a member of this couple.");
  }

  const [deletedLike] = await getDb()
    .delete(swipes)
    .where(
      and(
        eq(swipes.coupleId, coupleId),
        eq(swipes.userId, userId),
        eq(swipes.babyNameId, babyNameId),
        eq(swipes.direction, "like"),
      ),
    )
    .returning({ id: swipes.id });

  if (deletedLike) {
    await getDb()
      .delete(matches)
      .where(
        and(
          eq(matches.coupleId, coupleId),
          eq(matches.babyNameId, babyNameId),
        ),
      );
    await deleteMatchRankingsForName(coupleId, babyNameId);
  }

  return { removed: Boolean(deletedLike) };
}

export async function recordSwipe({
  coupleId,
  userId,
  babyNameId,
  direction,
}: {
  coupleId: string;
  userId: string;
  babyNameId: string;
  direction: SwipeDirection;
}) {
  const [membership] = await getDb()
    .select({ id: coupleMembers.id })
    .from(coupleMembers)
    .where(
      and(
        eq(coupleMembers.coupleId, coupleId),
        eq(coupleMembers.userId, userId),
        eq(coupleMembers.isActive, true),
      ),
    )
    .limit(1);

  if (!membership) {
    throw new Error("You are not a member of this couple.");
  }

  await getDb()
    .insert(swipes)
    .values({ coupleId, userId, babyNameId, direction, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [swipes.coupleId, swipes.userId, swipes.babyNameId],
      set: { direction, updatedAt: new Date() },
    });

  if (direction === "pass") {
    await getDb()
      .delete(matches)
      .where(
        and(
          eq(matches.coupleId, coupleId),
          eq(matches.babyNameId, babyNameId),
        ),
      );
    await deleteMatchRankingsForName(coupleId, babyNameId);

    return { matched: false as const };
  }

  const [partnerLike] = await getDb()
    .select({ id: swipes.id })
    .from(swipes)
    .where(
      and(
        eq(swipes.coupleId, coupleId),
        eq(swipes.babyNameId, babyNameId),
        eq(swipes.direction, "like"),
        ne(swipes.userId, userId),
      ),
    )
    .limit(1);

  if (!shouldCreateMatch({ direction, partnerLiked: Boolean(partnerLike) })) {
    return { matched: false as const };
  }

  await getDb()
    .insert(matches)
    .values({ coupleId, babyNameId })
    .onConflictDoNothing({
      target: [matches.coupleId, matches.babyNameId],
    });

  const [matchedName] = await getDb()
    .select({ id: babyNames.id, name: babyNames.name })
    .from(babyNames)
    .where(eq(babyNames.id, babyNameId))
    .limit(1);

  return { matched: true as const, name: matchedName?.name ?? "this name" };
}

export async function getMatchedNames(coupleId: string) {
  return getDb()
    .select({
      id: babyNames.id,
      name: babyNames.name,
      gender: babyNames.gender,
      origin: babyNames.origin,
      meaning: babyNames.meaning,
      popularityRank: babyNames.popularityRank,
      matchedAt: matches.createdAt,
    })
    .from(matches)
    .innerJoin(babyNames, eq(babyNames.id, matches.babyNameId))
    .where(eq(matches.coupleId, coupleId))
    .orderBy(desc(matches.createdAt), asc(babyNames.name));
}

export async function getMatchRankingsForUser(coupleId: string, userId: string) {
  return getDb()
    .select({
      babyNameId: matchRankings.babyNameId,
      name: babyNames.name,
      rank: matchRankings.rank,
    })
    .from(matchRankings)
    .innerJoin(babyNames, eq(babyNames.id, matchRankings.babyNameId))
    .where(
      and(eq(matchRankings.coupleId, coupleId), eq(matchRankings.userId, userId)),
    )
    .orderBy(asc(matchRankings.rank));
}

export async function getCoupleRankingContext(coupleId: string, userId: string) {
  const members = await getDb()
    .select({
      userId: coupleMembers.userId,
      role: coupleMembers.role,
    })
    .from(coupleMembers)
    .where(
      and(eq(coupleMembers.coupleId, coupleId), eq(coupleMembers.isActive, true)),
    );

  const allRankings = await getDb()
    .select({
      userId: matchRankings.userId,
      babyNameId: matchRankings.babyNameId,
      name: babyNames.name,
      rank: matchRankings.rank,
    })
    .from(matchRankings)
    .innerJoin(babyNames, eq(babyNames.id, matchRankings.babyNameId))
    .innerJoin(
      matches,
      and(
        eq(matches.coupleId, matchRankings.coupleId),
        eq(matches.babyNameId, matchRankings.babyNameId),
      ),
    )
    .where(eq(matchRankings.coupleId, coupleId))
    .orderBy(asc(matchRankings.rank));

  const rankingsByUser = new Map<string, RankingEntry[]>();
  for (const row of allRankings) {
    const existing = rankingsByUser.get(row.userId) ?? [];
    existing.push({
      babyNameId: row.babyNameId,
      name: row.name,
      rank: row.rank,
    });
    rankingsByUser.set(row.userId, existing);
  }

  const myRankings = rankingsByUser.get(userId) ?? [];
  const partner = members.find((member) => member.userId !== userId);
  const partnerRankings = partner
    ? (rankingsByUser.get(partner.userId) ?? [])
    : [];

  const summary = buildRankingSummary({
    members,
    rankingsByUser,
    currentUserId: userId,
  });

  return {
    myRankings,
    partnerRankings,
    summary,
    members,
  };
}

export async function setMatchRanking({
  coupleId,
  userId,
  babyNameId,
  rank,
}: {
  coupleId: string;
  userId: string;
  babyNameId: string;
  rank: 1 | 2 | 3 | null;
}) {
  const [membership] = await getDb()
    .select({ id: coupleMembers.id })
    .from(coupleMembers)
    .where(
      and(
        eq(coupleMembers.coupleId, coupleId),
        eq(coupleMembers.userId, userId),
        eq(coupleMembers.isActive, true),
      ),
    )
    .limit(1);

  if (!membership) {
    throw new Error("You are not a member of this couple.");
  }

  const [match] = await getDb()
    .select({ id: matches.id })
    .from(matches)
    .where(
      and(eq(matches.coupleId, coupleId), eq(matches.babyNameId, babyNameId)),
    )
    .limit(1);

  if (!match) {
    throw new Error("You can only rank names on your shared match list.");
  }

  if (rank === null) {
    await getDb()
      .delete(matchRankings)
      .where(
        and(
          eq(matchRankings.coupleId, coupleId),
          eq(matchRankings.userId, userId),
          eq(matchRankings.babyNameId, babyNameId),
        ),
      );
    return { cleared: true as const };
  }

  if (rank < 1 || rank > 3) {
    throw new Error("Rank must be 1, 2, or 3.");
  }

  await getDb()
    .delete(matchRankings)
    .where(
      and(
        eq(matchRankings.coupleId, coupleId),
        eq(matchRankings.userId, userId),
        eq(matchRankings.rank, rank),
      ),
    );

  await getDb()
    .insert(matchRankings)
    .values({
      coupleId,
      userId,
      babyNameId,
      rank,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [
        matchRankings.coupleId,
        matchRankings.userId,
        matchRankings.babyNameId,
      ],
      set: { rank, updatedAt: new Date() },
    });

  return { rank };
}
