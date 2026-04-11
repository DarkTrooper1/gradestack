import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TIERS = [
  { label: "Top Universities (Oxbridge / Medicine)", min: 200 },
  { label: "Russell Group", min: 160 },
  { label: "Strong University Entry", min: 120 },
  { label: "University Entry", min: 80 },
  { label: "Foundation / Lower Entry", min: 0 },
];

function getTier(points: number) {
  return TIERS.find((t) => points >= t.min) ?? TIERS[TIERS.length - 1];
}

function getNextTier(points: number) {
  const idx = TIERS.findIndex((t) => points >= t.min);
  return idx > 0 ? TIERS[idx - 1] : null;
}

export async function POST(req: Request) {
  try {
    const { total_points, qualifications } = await req.json();

    const tier = getTier(total_points);
    const nextTier = getNextTier(total_points);
    const pointsToNext = nextTier ? nextTier.min - total_points : null;

    const prompt = `You are a UK university admissions advisor. A student has ${total_points} UCAS tariff points.

Their qualifications:
${qualifications
  .filter((q: { lookup_status: string; excluded?: boolean }) => q.lookup_status === "found" && !q.excluded)
  .map((q: { display_name: string; points: number; grade: string; subject?: string }) => `- ${q.display_name || q.subject}: ${q.points} pts (grade: ${q.grade})`)
  .join("\n")}

Current tier: ${tier.label}
${pointsToNext ? `Points to next tier (${nextTier?.label}): ${pointsToNext}` : "Already at the highest tier."}

Return ONLY valid JSON in this exact shape:
{
  "tier_label": "${tier.label}",
  "tier_description": "2-3 sentence explanation of what this tier means for university applications, written directly to the student.",
  "quick_wins": [
    {
      "title": "short action title",
      "description": "specific actionable insight — e.g. upgrading a specific grade, or how many points needed to reach the next tier",
      "points_gain": 0
    }
  ]
}

Rules:
- quick_wins should have 2-4 items
- At least one quick_win should reference the specific points gap to the next tier if applicable
- Reference specific qualifications from their list where relevant
- Be direct and encouraging, not generic
- points_gain should be the estimated UCAS points gained from that action (0 if it's about crossing a boundary)`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 600,
    });

    const content = response.choices[0].message.content ?? "{}";
    const context = JSON.parse(content);

    return NextResponse.json(context);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
