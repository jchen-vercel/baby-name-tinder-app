import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  ensureAppUser,
  getActiveCoupleForUser,
  getPassedNames,
} from "@/lib/data";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const appUser = await ensureAppUser(userId);
    const activeCouple = await getActiveCoupleForUser(appUser.id);

    if (!activeCouple) {
      return NextResponse.json({ passes: [] });
    }

    const passes = await getPassedNames(
      activeCouple.couple.id,
      activeCouple.member.userId,
    );

    return NextResponse.json({ passes });
  } catch (error) {
    console.error("Load passes failed", error);
    return NextResponse.json(
      { error: "Unable to load passed names." },
      { status: 400 },
    );
  }
}
