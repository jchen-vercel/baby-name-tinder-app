import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  ensureAppUser,
  getActiveCoupleForUser,
  getLikedNames,
  removeLikedName,
} from "@/lib/data";
import { likeRequestSchema } from "@/lib/validation";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const appUser = await ensureAppUser(userId);
    const activeCouple = await getActiveCoupleForUser(appUser.id);

    if (!activeCouple) {
      return NextResponse.json({ likes: [] });
    }

    const likes = await getLikedNames(
      activeCouple.couple.id,
      activeCouple.member.userId,
    );

    return NextResponse.json({ likes });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load liked names.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = likeRequestSchema.parse(await request.json());
    const appUser = await ensureAppUser(userId);
    const result = await removeLikedName({
      coupleId: body.coupleId,
      userId: appUser.id,
      babyNameId: body.babyNameId,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof ZodError
        ? "Please check the liked name and try again."
        : error instanceof Error
          ? error.message
          : "Unable to remove liked name.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
