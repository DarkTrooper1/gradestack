import Anthropic from "@anthropic-ai/sdk";
import type { FreeAnalysis, PaidAnalysis } from "@/lib/shortlisted/types";

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

export const SYSTEM_PROMPT = `You are an expert UCAS personal statement reviewer with 15 years of experience as a UK university admissions tutor. You have reviewed thousands of personal statements across all subject areas. Score rigorously - the way a competitive admissions tutor reads them, not a supportive teacher. Do not inflate scores. An average statement scores 5–6. 8+ must be genuinely earned. Respond in valid JSON only, no preamble.`;

const JSON_RULES = `You must return ONLY valid JSON. Do not use apostrophes or single quotes anywhere in string values — use the unicode escape \\u2019 instead. Do not truncate the response. Do not wrap in markdown code blocks.`;

/**
 * Try to parse a raw Claude response as JSON.
 * Attempts: direct parse → strip markdown fence → extract first {...} block.
 * Returns null (and logs the raw string) if all three fail.
 */
function tryParse<T>(raw: string, label: string): T | null {
  const attempts = [
    raw,
    raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim(),
  ];

  for (const candidate of attempts) {
    try {
      return JSON.parse(candidate) as T;
    } catch {
      const match = candidate.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]) as T;
        } catch {
          // continue to next attempt
        }
      }
    }
  }

  console.error(
    `[shortlisted] Failed to parse ${label} Claude response as JSON. Raw response:\n${raw}`
  );
  return null;
}

/**
 * Call the Anthropic API, parse the JSON response, and automatically retry
 * once if parsing fails before throwing.
 */
async function callWithRetry<T>(
  buildMessage: () => Promise<Anthropic.Message>,
  label: string
): Promise<T> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const message = await buildMessage();
    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type from Claude");

    const parsed = tryParse<T>(content.text, label);
    if (parsed !== null) return parsed;

    if (attempt === 1) {
      console.warn(`[shortlisted] ${label}: JSON parse failed on attempt 1, retrying...`);
    }
  }

  throw new Error(`[shortlisted] ${label}: Claude returned unparseable JSON after retry`);
}

export async function runFreeAnalysis(statement: string): Promise<FreeAnalysis> {
  return callWithRetry<FreeAnalysis>(
    () =>
      getClient().messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Analyse this UCAS personal statement. Return ONLY valid JSON matching this exact shape:
{
  "overall_score": <number 0-100>,
  "overall_verdict": "<1 sentence - the single most important thing to fix>",
  "overall_summary": "<2-3 sentences, honest assessment>",
  "criteria": {
    "passion_motivation": {
      "score": <number 1-10>,
      "summary": "<3-4 sentences of specific feedback>",
      "top_fix": "<one concrete actionable fix>"
    },
    "academic_potential": { "score": <number 1-10> },
    "relevant_experience": { "score": <number 1-10> },
    "writing_quality": { "score": <number 1-10> },
    "course_suitability": { "score": <number 1-10> }
  }
}

${JSON_RULES}

Personal statement:
${statement}`,
          },
        ],
      }),
    "freeAnalysis"
  );
}

export async function runPaidAnalysis(statement: string): Promise<PaidAnalysis> {
  return callWithRetry<PaidAnalysis>(
    () =>
      getClient().messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Analyse this UCAS personal statement in full detail. Return ONLY valid JSON matching this exact shape:
{
  "overall_score": <number 0-100>,
  "overall_verdict": "<1 sentence - the single most important thing to fix>",
  "overall_summary": "<2-3 sentences, honest assessment>",
  "criteria": {
    "passion_motivation": {
      "score": <number 1-10>,
      "summary": "<3-4 sentences of specific feedback>",
      "top_fix": "<one concrete actionable fix>"
    },
    "academic_potential": {
      "score": <number 1-10>,
      "summary": "<3-4 sentences of specific feedback>",
      "top_fix": "<one concrete actionable fix>"
    },
    "relevant_experience": {
      "score": <number 1-10>,
      "summary": "<3-4 sentences of specific feedback>",
      "top_fix": "<one concrete actionable fix>"
    },
    "writing_quality": {
      "score": <number 1-10>,
      "summary": "<3-4 sentences of specific feedback>",
      "top_fix": "<one concrete actionable fix>"
    },
    "course_suitability": {
      "score": <number 1-10>,
      "summary": "<3-4 sentences of specific feedback>",
      "top_fix": "<one concrete actionable fix>"
    }
  },
  "paragraph_annotations": [
    {
      "paragraph_index": <number starting at 0>,
      "paragraph_preview": "<first 60 chars of the paragraph>",
      "rating": "<'strong' | 'adequate' | 'weak'>",
      "comment": "<1-2 sentences>"
    }
  ],
  "rewrite_suggestions": [
    {
      "criterion": "<criterion name>",
      "original": "<exact quote of 30 words or fewer from the statement>",
      "rewrite": "<improved version>",
      "reason": "<why this is better>"
    }
  ]
}

Notes:
- Include all paragraphs in paragraph_annotations
- Provide 2-3 rewrite_suggestions targeting the weakest criteria

${JSON_RULES}

Personal statement:
${statement}`,
          },
        ],
      }),
    "paidAnalysis"
  );
}
