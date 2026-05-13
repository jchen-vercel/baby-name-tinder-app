import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type NameRow = {
  name: string;
  gender: "boy" | "girl" | "neutral" | "unknown";
  origin: string;
  meaning: string;
  popularity_rank: string;
  source: string;
};

type NameDetail = {
  nameData?: string;
};

type ParsedNameData = {
  country?: string[];
  meaning?: Array<Record<string, string>>;
  notes?: string;
};

const csvPath = path.join(process.cwd(), "data", "baby-names.csv");
const csvHeaders = [
  "name",
  "gender",
  "origin",
  "meaning",
  "popularity_rank",
  "source",
] as const;

function parseCsvLine(line: string) {
  const values: string[] = [];
  let currentValue = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      currentValue += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(currentValue);
      currentValue = "";
      continue;
    }

    currentValue += char;
  }

  values.push(currentValue);
  return values;
}

async function readSeedRows() {
  const csv = await readFile(csvPath, "utf8");
  const [headerLine, ...lines] = csv.trim().split(/\r?\n/);
  const headers = parseCsvLine(headerLine);

  return lines.map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(
      headers.map((header, index) => [header, values[index] ?? ""]),
    ) as NameRow;
  });
}

function csvEscape(value: string) {
  if (!/[",\n\r]/.test(value)) {
    return value;
  }

  return `"${value.replaceAll('"', '""')}"`;
}

function formatMeaning(meaning: ParsedNameData["meaning"]) {
  if (!Array.isArray(meaning)) {
    return "";
  }

  return meaning
    .flatMap((entry) =>
      Object.entries(entry).map(([key, value]) => {
        if (key === "meaning") {
          return value;
        }

        if (key === "language") {
          return "";
        }

        return `${key}: ${value}`;
      }),
    )
    .filter(Boolean)
    .join("; ");
}

function sentenceWith(notes: string | undefined, patterns: RegExp[]) {
  if (!notes) {
    return "";
  }

  const sentences = notes
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  return (
    sentences.find((sentence) =>
      patterns.some((pattern) => pattern.test(sentence)),
    ) ?? ""
  );
}

function originFromNotes(notes: string | undefined) {
  if (!notes) {
    return "";
  }

  if (/English-speaking countries/i.test(notes)) {
    return "English-speaking countries";
  }

  return "";
}

function meaningFromNotes(notes: string | undefined) {
  return sentenceWith(notes, [
    /\bmeaning\b/i,
    /\bderived from\b/i,
    /\bcomes from\b/i,
    /\boriginates from\b/i,
  ]);
}

function parseNameData(detail: NameDetail) {
  if (!detail.nameData) {
    return null;
  }

  const nameData = JSON.parse(detail.nameData) as ParsedNameData;
  const origin = Array.isArray(nameData.country)
    ? nameData.country.filter(Boolean).join(", ")
    : "";
  const meaning = formatMeaning(nameData.meaning);
  const fallbackOrigin = originFromNotes(nameData.notes);
  const fallbackMeaning = meaningFromNotes(nameData.notes);

  if (!origin && !meaning && !fallbackOrigin && !fallbackMeaning) {
    return null;
  }

  return {
    origin: origin || fallbackOrigin,
    meaning: meaning || fallbackMeaning,
  };
}

function sexForGender(gender: NameRow["gender"]) {
  if (gender === "boy") {
    return "m";
  }

  if (gender === "girl") {
    return "f";
  }

  return null;
}

async function main() {
  const usBabyNames = (await import("usbabynames")) as {
    getDetailed(name: string, sex: string): Promise<NameDetail>;
  };
  const rows = await readSeedRows();
  let enrichedCount = 0;
  let missingCount = 0;

  for (const row of rows) {
    const sex = sexForGender(row.gender);

    if (!sex) {
      missingCount += 1;
      continue;
    }

    const detail = await usBabyNames.getDetailed(row.name.toLowerCase(), sex);
    const enrichedData = parseNameData(detail);

    if (!enrichedData) {
      missingCount += 1;
      continue;
    }

    row.origin = enrichedData.origin || row.origin;
    row.meaning = enrichedData.meaning || row.meaning;
    row.source = row.source.includes("usbabynames details")
      ? row.source
      : `${row.source} + usbabynames details`;
    enrichedCount += 1;
  }

  const csv = [
    csvHeaders.join(","),
    ...rows.map((row) =>
      csvHeaders.map((header) => csvEscape(row[header])).join(","),
    ),
  ].join("\n");

  await writeFile(csvPath, `${csv}\n`);
  console.log(
    `Enriched ${enrichedCount} names. ${missingCount} names still missing detail data.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
