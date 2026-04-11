import Anthropic from "@anthropic-ai/sdk";

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

export const SYSTEM_PROMPT = `You are an expert UCAS personal statement reviewer with 15 years of experience as a UK university admissions tutor. You have reviewed thousands of personal statements across all subject areas. Score rigorously - the way a competitive admissions tutor reads them, not a supportive teacher. Do not inflate scores. An average statement scores 5–6. 8+ must be genuinely earned. Respond in valid JSON only, no preamble.`;

export async function runFreeAnalysis(statement: string): Promise<string> {
  const client = getClient();
  const message = await client.messages.create({
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

Personal statement:
${statement}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  return content.text;
}

export async function runPaidAnalysis(statement: string): Promise<string> {
  const client = getClient();
  const message = await client.messages.create({
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

Personal statement:
${statement}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  return content.text;
}
