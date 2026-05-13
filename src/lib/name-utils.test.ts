import { describe, expect, it } from "vitest";

import { normalizeBabyName } from "./name-utils";

describe("normalizeBabyName", () => {
  it("normalizes case, accents, and punctuation for deduping", () => {
    expect(normalizeBabyName(" Élodie-Rose ")).toBe("elodierose");
  });
});
