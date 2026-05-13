import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  ensureAppUser,
  getActiveCoupleForUser,
  getSwipeDeck,
  recordSwipe,
} from "@/lib/data";
import { swipeRequestSchema } from "@/lib/validation";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const appUser = await ensureAppUser(userId);
    const activeCouple = await getActiveCoupleForUser(appUser.id);

    if (!activeCouple) {
      return NextResponse.json({ names: [] });
    }

    const names = await getSwipeDeck(
      activeCouple.couple.id,
      activeCouple.member.userId,
      activeCouple.member.namePreference,
    );

    return NextResponse.json({ names });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load more names.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = swipeRequestSchema.parse(await request.json());
    const appUser = await ensureAppUser(userId);
    const result = await recordSwipe({
      coupleId: body.coupleId,
      userId: appUser.id,
      babyNameId: body.babyNameId,
      direction: body.direction,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof ZodError
        ? "Please check the swipe and try again."
        : error instanceof Error
          ? error.message
          : "Unable to save swipe.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
