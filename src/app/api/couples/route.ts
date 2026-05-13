import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  createCoupleForUser,
  ensureAppUser,
  joinCoupleForUser,
} from "@/lib/data";
import { coupleRequestSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = coupleRequestSchema.parse(await request.json());
    const appUser = await ensureAppUser(userId);
    const result =
      body.action === "create"
        ? await createCoupleForUser(appUser.id, body.role, body.namePreference)
        : await joinCoupleForUser(
            appUser.id,
            body.role,
            body.namePreference,
            body.inviteCode,
          );

    return NextResponse.json({
      coupleId: result.couple.id,
      inviteCode: result.couple.inviteCode,
      role: result.member.role,
      namePreference: result.member.namePreference,
    });
  } catch (error) {
    const message =
      error instanceof ZodError
        ? "Please check the form and try again."
        : error instanceof Error
          ? error.message
          : "Unable to update couple.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
