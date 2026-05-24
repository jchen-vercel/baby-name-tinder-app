import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  ensureAppUser,
  getActiveCoupleForUser,
  getCoupleRankingContext,
  setMatchRanking,
} from "@/lib/data";
import { matchRankingRequestSchema } from "@/lib/validation";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const appUser = await ensureAppUser(userId);
    const activeCouple = await getActiveCoupleForUser(appUser.id);

    if (!activeCouple) {
      return NextResponse.json({
        myRankings: [],
        partnerRankings: [],
        summary: {
          perfectPicks: [],
          strongOverlaps: [],
          partnerRankedCount: 0,
        },
      });
    }

    const context = await getCoupleRankingContext(
      activeCouple.couple.id,
      appUser.id,
    );

    return NextResponse.json(context);
  } catch (error) {
    console.error("Load match rankings failed", error);
    return NextResponse.json(
      { error: "Unable to load match rankings." },
      { status: 400 },
    );
  }
}

export async function PUT(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = matchRankingRequestSchema.parse(await request.json());
    const appUser = await ensureAppUser(userId);
    const result = await setMatchRanking({
      coupleId: body.coupleId,
      userId: appUser.id,
      babyNameId: body.babyNameId,
      rank: body.rank,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Please check the ranking and try again." },
        { status: 400 },
      );
    }

    console.error("Save match ranking failed", error);
    return NextResponse.json(
      { error: "Unable to save match ranking." },
      { status: 400 },
    );
  }
}
