import { describe, expect, it } from "vitest";

import {
  coupleRequestSchema,
  likeRequestSchema,
  preferenceRequestSchema,
} from "./validation";

describe("coupleRequestSchema", () => {
  it("requires a name preference during onboarding", () => {
    expect(
      coupleRequestSchema.safeParse({
        action: "create",
        role: "mother",
        namePreference: "both",
      }).success,
    ).toBe(true);

    expect(
      coupleRequestSchema.safeParse({
        action: "create",
        role: "mother",
      }).success,
    ).toBe(false);
  });
});

describe("preferenceRequestSchema", () => {
  it("accepts girl, boy, or both for account settings", () => {
    expect(
      preferenceRequestSchema.safeParse({ namePreference: "girl" }).success,
    ).toBe(true);
    expect(
      preferenceRequestSchema.safeParse({ namePreference: "boy" }).success,
    ).toBe(true);
    expect(
      preferenceRequestSchema.safeParse({ namePreference: "both" }).success,
    ).toBe(true);
  });
});

describe("likeRequestSchema", () => {
  it("accepts the liked name payload used for deletion", () => {
    expect(
      likeRequestSchema.safeParse({
        coupleId: "00000000-0000-4000-8000-000000000001",
        babyNameId: "00000000-0000-4000-8000-000000000002",
      }).success,
    ).toBe(true);
  });
});
