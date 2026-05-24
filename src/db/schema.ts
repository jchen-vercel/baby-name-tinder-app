import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const parentRoleEnum = pgEnum("parent_role", ["mother", "father"]);
export const swipeDirectionEnum = pgEnum("swipe_direction", ["like", "pass"]);
export const coupleStatusEnum = pgEnum("couple_status", ["active", "archived"]);
export const nameGenderEnum = pgEnum("name_gender", [
  "girl",
  "boy",
  "neutral",
  "unknown",
]);
export const namePreferenceEnum = pgEnum("name_preference", [
  "boy",
  "girl",
  "both",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkUserId: text("clerk_user_id").notNull(),
    email: text("email"),
    displayName: text("display_name"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    clerkUserIdIdx: uniqueIndex("users_clerk_user_id_idx").on(
      table.clerkUserId,
    ),
  }),
);

export const couples = pgTable(
  "couples",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    inviteCode: text("invite_code").notNull(),
    status: coupleStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    inviteCodeIdx: uniqueIndex("couples_invite_code_idx").on(table.inviteCode),
  }),
);

export const coupleMembers = pgTable(
  "couple_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: parentRoleEnum("role").notNull(),
    namePreference: namePreferenceEnum("name_preference")
      .default("girl")
      .notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userActiveCoupleIdx: uniqueIndex("couple_members_user_active_couple_idx")
      .on(table.userId)
      .where(sql`${table.isActive} = true`),
    coupleRoleIdx: uniqueIndex("couple_members_couple_role_idx")
      .on(table.coupleId, table.role)
      .where(sql`${table.isActive} = true`),
    coupleUserIdx: uniqueIndex("couple_members_couple_user_idx").on(
      table.coupleId,
      table.userId,
    ),
  }),
);

export const babyNames = pgTable(
  "baby_names",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    gender: nameGenderEnum("gender").default("unknown").notNull(),
    origin: text("origin"),
    meaning: text("meaning"),
    popularityRank: integer("popularity_rank"),
    source: text("source").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    normalizedNameIdx: uniqueIndex("baby_names_normalized_name_idx").on(
      table.normalizedName,
    ),
    popularityIdx: index("baby_names_popularity_idx").on(table.popularityRank),
  }),
);

export const swipes = pgTable(
  "swipes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    babyNameId: uuid("baby_name_id")
      .notNull()
      .references(() => babyNames.id, { onDelete: "cascade" }),
    direction: swipeDirectionEnum("direction").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    uniqueSwipeIdx: uniqueIndex("swipes_unique_user_name_idx").on(
      table.coupleId,
      table.userId,
      table.babyNameId,
    ),
    coupleNameIdx: index("swipes_couple_name_idx").on(
      table.coupleId,
      table.babyNameId,
    ),
  }),
);

export const matches = pgTable(
  "matches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    babyNameId: uuid("baby_name_id")
      .notNull()
      .references(() => babyNames.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    uniqueMatchIdx: uniqueIndex("matches_unique_couple_name_idx").on(
      table.coupleId,
      table.babyNameId,
    ),
  }),
);

export const matchRankings = pgTable(
  "match_rankings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    babyNameId: uuid("baby_name_id")
      .notNull()
      .references(() => babyNames.id, { onDelete: "cascade" }),
    rank: integer("rank").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    uniqueUserRankSlotIdx: uniqueIndex("match_rankings_user_rank_slot_idx").on(
      table.coupleId,
      table.userId,
      table.rank,
    ),
    uniqueUserNameIdx: uniqueIndex("match_rankings_user_name_idx").on(
      table.coupleId,
      table.userId,
      table.babyNameId,
    ),
  }),
);

export type BabyName = typeof babyNames.$inferSelect;
export type Couple = typeof couples.$inferSelect;
export type CoupleMember = typeof coupleMembers.$inferSelect;
export type NamePreference = (typeof namePreferenceEnum.enumValues)[number];
export type ParentRole = (typeof parentRoleEnum.enumValues)[number];
export type SwipeDirection = (typeof swipeDirectionEnum.enumValues)[number];
