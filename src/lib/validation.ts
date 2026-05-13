import { z } from "zod";

export const parentRoleSchema = z.enum(["mother", "father"]);
export const namePreferenceSchema = z.enum(["boy", "girl", "both"]);

export const coupleRequestSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create"),
    role: parentRoleSchema,
    namePreference: namePreferenceSchema,
  }),
  z.object({
    action: z.literal("join"),
    role: parentRoleSchema,
    namePreference: namePreferenceSchema,
    inviteCode: z.string().trim().min(4).max(12),
  }),
]);

export const swipeRequestSchema = z.object({
  coupleId: z.uuid(),
  babyNameId: z.uuid(),
  direction: z.enum(["like", "pass"]),
});

export const likeRequestSchema = z.object({
  coupleId: z.uuid(),
  babyNameId: z.uuid(),
});

export const preferenceRequestSchema = z.object({
  namePreference: namePreferenceSchema,
});
