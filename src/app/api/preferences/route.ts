import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { ensureAppUser, updateNamePreference } from "@/lib/data";
import { preferenceRequestSchema } from "@/lib/validation";

export async function PATCH(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = preferenceRequestSchema.parse(await request.json());
    const appUser = await ensureAppUser(userId);
    const member = await updateNamePreference(appUser.id, body.namePreference);

    return NextResponse.json({ namePreference: member.namePreference });
  } catch (error) {
    const message =
      error instanceof ZodError
        ? "Choose girl, boy, or both."
        : error instanceof Error
          ? error.message
          : "Unable to update preferences.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
