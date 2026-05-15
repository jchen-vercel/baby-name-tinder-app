import { auth } from "@clerk/nextjs/server";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";

import {
  ensureAppUser,
  getActiveCoupleForUser,
} from "@/lib/data";
import {
  lookupNameByString,
  recommendBabyNames,
  searchBabyNames,
} from "@/lib/name-chat";

const MODEL = "anthropic/claude-sonnet-4.6";

const systemPrompt = `You are a friendly, concise baby name assistant inside "Baby Name Tinder".
You help parents explore names that exist in the app's database (seeded from the team CSV into Postgres).

Rules:
- For facts about a specific name (meaning, origin, gender, popularity rank), ONLY use data returned by your tools. If a field is null in tool results, say it is unknown in the dataset.
- For recommendations, call recommendNames and/or searchNames first, then suggest a shortlist from those results with brief reasons (e.g. origin, meaning snippet, popularity).
- If the user's query is vague, ask one clarifying question (length, style, origin, boy/girl/both) before recommending.
- Do not invent names that are not in tool output. If nothing matches, say so and suggest broadening the search.
- Keep replies readable on mobile: use short paragraphs or bullet lists.`;

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const messages = (body as { messages?: UIMessage[] }).messages;
  if (!Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: "messages array required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const appUser = await ensureAppUser(userId);
  const activeCouple = await getActiveCoupleForUser(appUser.id);
  const namePreference = activeCouple?.member.namePreference ?? "both";
  const coupleId = activeCouple?.couple.id ?? "";
  const dbUserId = appUser.id;

  const result = streamText({
    model: MODEL,
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(10),
    tools: {
      lookupName: tool({
        description:
          "Find baby name(s) by exact normalized match or close name spelling. Uses only the app database.",
        inputSchema: z.object({
          name: z.string().describe("Baby name to look up"),
        }),
        execute: async ({ name }) => ({
          names: await lookupNameByString(name),
        }),
      }),
      searchNames: tool({
        description:
          "Search names by keyword across name, origin, and meaning. Respects the user's current boy/girl/both preference for the swipe deck.",
        inputSchema: z.object({
          query: z.string().describe("Search text"),
          limit: z.number().int().min(1).max(25).optional(),
        }),
        execute: async ({ query, limit }) => ({
          names: await searchBabyNames({
            query,
            genderPreference: namePreference,
            limit: limit ?? 15,
          }),
        }),
      }),
      recommendNames: tool({
        description:
          "Suggest names aligned with deck gender filters, optionally matching keywords, and optionally excluding names this user already swiped on.",
        inputSchema: z.object({
          keywords: z
            .string()
            .optional()
            .describe("Optional terms to match in name, origin, or meaning"),
          excludeSwiped: z
            .boolean()
            .optional()
            .describe("Exclude names the user has already swiped (default true)"),
          limit: z.number().int().min(1).max(25).optional(),
        }),
        execute: async ({ keywords, excludeSwiped, limit }) => {
          if (!coupleId) {
            return {
              names: [],
              notice:
                "No active couple yet—recommendations that exclude swipes are unavailable. Use searchNames or lookupName, or finish onboarding.",
            };
          }

          const names = await recommendBabyNames({
            coupleId,
            userId: dbUserId,
            namePreference,
            keywords,
            excludeSwiped: excludeSwiped ?? true,
            limit: limit ?? 15,
          });

          return { names };
        },
      }),
    },
    providerOptions: {
      gateway: {
        user: userId,
        tags: ["feature:name-chat"],
      },
    },
  });

  return result.toUIMessageStreamResponse();
}
