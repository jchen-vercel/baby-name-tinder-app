import { readFile } from "node:fs/promises";
import path from "node:path";

import { getDb } from "../src/db";
import { babyNames, type BabyName } from "../src/db/schema";
import { normalizeBabyName } from "../src/lib/name-utils";

type SeedName = Pick<
  BabyName,
  "name" | "normalizedName" | "gender" | "origin" | "meaning" | "source"
> & {
  popularityRank: number | null;
};

const csvPath = path.join(process.cwd(), "data", "baby-names.csv");

function parseCsvLine(line: string) {
  const values: string[] = [];
  let currentValue = "";
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(currentValue.trim());
      currentValue = "";
      continue;
    }

    currentValue += char;
  }

  values.push(currentValue.trim());
  return values;
}

async function loadSeedNames() {
  const csv = await readFile(csvPath, "utf8");
  const [, ...rows] = csv.trim().split(/\r?\n/);
  const seen = new Set<string>();
  const names: SeedName[] = [];

  for (const row of rows) {
    const [name, gender, origin, meaning, popularityRank, source] =
      parseCsvLine(row);
    const normalizedName = normalizeBabyName(name);

    if (!normalizedName || seen.has(normalizedName)) {
      continue;
    }

    seen.add(normalizedName);
    names.push({
      name,
      normalizedName,
      gender: ["girl", "boy", "neutral", "unknown"].includes(gender)
        ? (gender as SeedName["gender"])
        : "unknown",
      origin: origin || null,
      meaning: meaning || null,
      popularityRank: popularityRank ? Number(popularityRank) : null,
      source: source || "starter dataset",
    });
  }

  return names;
}

async function main() {
  const seedNames = await loadSeedNames();

  for (const seedName of seedNames) {
    await getDb()
      .insert(babyNames)
      .values(seedName)
      .onConflictDoUpdate({
        target: babyNames.normalizedName,
        set: {
          name: seedName.name,
          gender: seedName.gender,
          origin: seedName.origin,
          meaning: seedName.meaning,
          popularityRank: seedName.popularityRank,
          source: seedName.source,
        },
      });
  }

  console.log(`Seeded ${seedNames.length} baby names.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
