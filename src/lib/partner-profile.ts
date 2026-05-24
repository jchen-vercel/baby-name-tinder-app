import "server-only";

import { clerkClient } from "@clerk/nextjs/server";
import { and, eq, ne } from "drizzle-orm";

import { getDb } from "@/db";
import { coupleMembers, users } from "@/db/schema";

export type PartnerProfile = {
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  role: "mother" | "father";
};

export async function getPartnerProfile(
  coupleId: string,
  currentUserId: string,
): Promise<PartnerProfile | null> {
  const [partnerMember] = await getDb()
    .select({
      role: coupleMembers.role,
      clerkUserId: users.clerkUserId,
    })
    .from(coupleMembers)
    .innerJoin(users, eq(users.id, coupleMembers.userId))
    .where(
      and(
        eq(coupleMembers.coupleId, coupleId),
        eq(coupleMembers.isActive, true),
        ne(coupleMembers.userId, currentUserId),
      ),
    )
    .limit(1);

  if (!partnerMember) {
    return null;
  }

  const clerk = await clerkClient();
  const clerkUser = await clerk.users.getUser(partnerMember.clerkUserId);

  return {
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    imageUrl: clerkUser.imageUrl,
    role: partnerMember.role,
  };
}
