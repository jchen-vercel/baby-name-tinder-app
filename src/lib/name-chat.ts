import "server-only";

import { and, asc, eq, inArray, notExists, or, sql } from "drizzle-orm";

import { getDb } from "@/db";
import {
  babyNames,
  swipes,
  type NamePreference,
} from "@/db/schema";
import { normalizeBabyName } from "@/lib/name-utils";

const deckGenders = {
  boy: ["boy"],
  girl: ["girl"],
  both: ["boy", "girl"],
} as const satisfies Record<NamePreference, ReadonlyArray<"boy" | "girl">>;

export type NameChatRow = {
  id: string;
  name: string;
  gender: "girl" | "boy" | "neutral" | "unknown";
  origin: string | null;
  meaning: string | null;
  popularityRank: number | null;
};

function escapeIlikeUserInput(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function toRows(
  rows: Array<{
    id: string;
    name: string;
    gender: NameChatRow["gender"];
    origin: string | null;
    meaning: string | null;
    popularityRank: number | null;
  }>,
): NameChatRow[] {
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    gender: r.gender,
    origin: r.origin,
    meaning: r.meaning,
    popularityRank: r.popularityRank,
  }));
}

export async function lookupNameByString(rawName: string, limit = 5) {
  const trimmed = rawName.trim();
  if (!trimmed) {
    return [] as NameChatRow[];
  }

  const normalized = normalizeBabyName(trimmed);

  const db = getDb();

  const exactNormalized = await db
    .select({
      id: babyNames.id,
      name: babyNames.name,
      gender: babyNames.gender,
      origin: babyNames.origin,
      meaning: babyNames.meaning,
      popularityRank: babyNames.popularityRank,
    })
    .from(babyNames)
    .where(eq(babyNames.normalizedName, normalized))
    .limit(limit);

  if (exactNormalized.length > 0) {
    return toRows(exactNormalized);
  }

  const pattern = `%${escapeIlikeUserInput(trimmed)}%`;

  const fuzzy = await db
    .select({
      id: babyNames.id,
      name: babyNames.name,
      gender: babyNames.gender,
      origin: babyNames.origin,
      meaning: babyNames.meaning,
      popularityRank: babyNames.popularityRank,
    })
    .from(babyNames)
    .where(sql`${babyNames.name} ILIKE ${pattern}`)
    .orderBy(asc(babyNames.popularityRank), asc(babyNames.name))
    .limit(limit);

  return toRows(fuzzy);
}

export async function searchBabyNames({
  query,
  genderPreference = "both",
  limit = 15,
}: {
  query: string;
  genderPreference?: NamePreference;
  limit?: number;
}) {
  const trimmed = query.trim();
  if (!trimmed) {
    return [] as NameChatRow[];
  }

  const pattern = `%${escapeIlikeUserInput(trimmed)}%`;
  const genders = [...deckGenders[genderPreference]];

  const db = getDb();

  const rows = await db
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
        inArray(babyNames.gender, genders),
        or(
          sql`${babyNames.name} ILIKE ${pattern}`,
          sql`${babyNames.origin} ILIKE ${pattern}`,
          sql`${babyNames.meaning} ILIKE ${pattern}`,
        ),
      ),
    )
    .orderBy(asc(babyNames.popularityRank), asc(babyNames.name))
    .limit(Math.min(Math.max(limit, 1), 25));

  return toRows(rows);
}

export async function recommendBabyNames({
  coupleId,
  userId,
  namePreference,
  keywords,
  excludeSwiped = true,
  limit = 15,
}: {
  coupleId: string;
  userId: string;
  namePreference: NamePreference;
  keywords?: string;
  excludeSwiped?: boolean;
  limit?: number;
}) {
  const genders = [...deckGenders[namePreference]];
  const db = getDb();

  const parts = [inArray(babyNames.gender, genders)];

  if (excludeSwiped) {
    parts.push(
      notExists(
        db
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
    );
  }

  const trimmedKeywords = keywords?.trim();
  if (trimmedKeywords) {
    const pattern = `%${escapeIlikeUserInput(trimmedKeywords)}%`;
    parts.push(
      or(
        sql`${babyNames.meaning} ILIKE ${pattern}`,
        sql`${babyNames.origin} ILIKE ${pattern}`,
        sql`${babyNames.name} ILIKE ${pattern}`,
      )!,
    );
  }

  const rows = await db
    .select({
      id: babyNames.id,
      name: babyNames.name,
      gender: babyNames.gender,
      origin: babyNames.origin,
      meaning: babyNames.meaning,
      popularityRank: babyNames.popularityRank,
    })
    .from(babyNames)
    .where(and(...parts))
    .orderBy(asc(babyNames.popularityRank), asc(babyNames.name))
    .limit(Math.min(Math.max(limit, 1), 25));

  return toRows(rows);
}
