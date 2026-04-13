import Anthropic from "@anthropic-ai/sdk";
import type { FreeAnalysis, PaidAnalysis } from "@/lib/shortlisted/types";

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

export const SYSTEM_PROMPT = `You are an expert UCAS personal statement reviewer with 15 years of experience as a UK university admissions tutor. You have reviewed thousands of personal statements across all subject areas. Score rigorously - the way a competitive admissions tutor reads them, not a supportive teacher. Do not inflate scores. An average statement scores 5–6. 8+ must be genuinely earned.`;

const CRITERION_FULL_SCHEMA = {
  type: "object",
  properties: {
    score: { type: "number", description: "Score 1-10" },
    summary: { type: "string", description: "3-4 sentences of specific feedback" },
    top_fix: { type: "string", description: "One concrete actionable fix" },
  },
  required: ["score", "summary", "top_fix"],
} as const;

const CRITERION_FREE_SCHEMA = {
  type: "object",
  properties: {
    score: { type: "number", description: "Score 1-10" },
  },
  required: ["score"],
} as const;

const FREE_TOOL: Anthropic.Tool = {
  name: "submit_analysis",
  description: "Submit the free analysis result",
  input_schema: {
    type: "object",
    properties: {
      overall_score: { type: "number", description: "Overall score 0-100" },
      overall_verdict: { type: "string", description: "1 sentence — the single most important thing to fix" },
      overall_summary: { type: "string", description: "2-3 sentences, honest assessment" },
      criteria: {
        type: "object",
        properties: {
          passion_motivation: CRITERION_FULL_SCHEMA,
          academic_potential: CRITERION_FREE_SCHEMA,
          relevant_experience: CRITERION_FREE_SCHEMA,
          writing_quality: CRITERION_FREE_SCHEMA,
          course_suitability: CRITERION_FREE_SCHEMA,
        },
        required: [
          "passion_motivation",
          "academic_potential",
          "relevant_experience",
          "writing_quality",
          "course_suitability",
        ],
      },
    },
    required: ["overall_score", "overall_verdict", "overall_summary", "criteria"],
  },
};

const PAID_TOOL: Anthropic.Tool = {
  name: "submit_analysis",
  description: "Submit the full paid analysis result",
  input_schema: {
    type: "object",
    properties: {
      overall_score: { type: "number", description: "Overall score 0-100" },
      overall_verdict: { type: "string", description: "1 sentence — the single most important thing to fix" },
      overall_summary: { type: "string", description: "2-3 sentences, honest assessment" },
      criteria: {
        type: "object",
        properties: {
          passion_motivation: CRITERION_FULL_SCHEMA,
          academic_potential: CRITERION_FULL_SCHEMA,
          relevant_experience: CRITERION_FULL_SCHEMA,
          writing_quality: CRITERION_FULL_SCHEMA,
          course_suitability: CRITERION_FULL_SCHEMA,
        },
        required: [
          "passion_motivation",
          "academic_potential",
          "relevant_experience",
          "writing_quality",
          "course_suitability",
        ],
      },
      paragraph_annotations: {
        type: "array",
        description: "Annotation for every paragraph",
        items: {
          type: "object",
          properties: {
            paragraph_index: { type: "number", description: "0-based index" },
            paragraph_preview: { type: "string", description: "First 60 chars of the paragraph" },
            rating: { type: "string", enum: ["strong", "adequate", "weak"] },
            comment: { type: "string", description: "1-2 sentences" },
          },
          required: ["paragraph_index", "paragraph_preview", "rating", "comment"],
        },
      },
      rewrite_suggestions: {
        type: "array",
        description: "2-3 targeted rewrite suggestions for the weakest criteria",
        items: {
          type: "object",
          properties: {
            criterion: { type: "string" },
            original: { type: "string", description: "Exact quote of 30 words or fewer from the statement" },
            rewrite: { type: "string", description: "Improved version" },
            reason: { type: "string", description: "Why this is better" },
          },
          required: ["criterion", "original", "rewrite", "reason"],
        },
      },
    },
    required: [
      "overall_score",
      "overall_verdict",
      "overall_summary",
      "criteria",
      "paragraph_annotations",
      "rewrite_suggestions",
    ],
  },
};

export async function runFreeAnalysis(statement: string): Promise<FreeAnalysis> {
  const message = await getClient().messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: [FREE_TOOL],
    tool_choice: { type: "tool", name: "submit_analysis" },
    messages: [
      {
        role: "user",
        content: `Analyse this UCAS personal statement. For the free analysis, provide full detail only for passion_motivation; include scores only for the other four criteria.\n\nPersonal statement:\n${statement}`,
      },
    ],
  });

  const block = message.content[0];
  if (block.type !== "tool_use") {
    throw new Error("[shortlisted] freeAnalysis: unexpected response type from Claude");
  }

  return block.input as FreeAnalysis;
}

export async function runPaidAnalysis(statement: string): Promise<PaidAnalysis> {
  const message = await getClient().messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    tools: [PAID_TOOL],
    tool_choice: { type: "tool", name: "submit_analysis" },
    messages: [
      {
        role: "user",
        content: `Analyse this UCAS personal statement in full detail. Include annotations for every paragraph and 2-3 rewrite suggestions targeting the weakest criteria.\n\nPersonal statement:\n${statement}`,
      },
    ],
  });

  const block = message.content[0];
  if (block.type !== "tool_use") {
    throw new Error("[shortlisted] paidAnalysis: unexpected response type from Claude");
  }

  return block.input as PaidAnalysis;
}
