import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { redis, SESSION_TTL } from "@/lib/shortlisted/redis";
import { SYSTEM_PROMPT } from "@/lib/shortlisted/claude";
import { sendResultsEmail } from "@/lib/shortlisted/email";
import type { PaidAnalysis } from "@/lib/shortlisted/types";

// Claude streaming can take 20-40s — maxDuration applies on Pro/Enterprise.
// On Hobby this is ignored but the streaming connection from the browser
// keeps the response alive regardless of the serverless timeout.
export const maxDuration = 60;

const PAID_PROMPT = (statement: string) => `Analyse this UCAS personal statement in full detail. Return ONLY valid JSON matching this exact shape:
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
${statement}`;

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    sessionId: string;
    checkOnly?: boolean;
  };
  const { sessionId, checkOnly } = body;

  if (!sessionId) {
    return new Response(JSON.stringify({ error: "sessionId is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Gate: payment must be confirmed by webhook before we run analysis
  const confirmed = await redis.get<boolean>(
    `session:${sessionId}:paid_confirmed`
  );
  if (!confirmed) {
    return new Response(
      JSON.stringify({ error: "Payment not confirmed for this session" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // checkOnly is used by the results page to poll until paid_confirmed is set
  if (checkOnly) {
    return new Response(JSON.stringify({ confirmed: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Idempotency: if analysis already completed, return it immediately
  const existing = await redis.get<PaidAnalysis>(`session:${sessionId}:paid`);
  if (existing) {
    return new Response(JSON.stringify({ done: true, analysis: existing }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Fetch the original statement
  const meta = await redis.get<{ statement: string; email: string }>(
    `session:${sessionId}:meta`
  );
  if (!meta) {
    return new Response(
      JSON.stringify({ error: "Session not found or expired" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  const { statement, email } = meta;

  // Stream Claude's response back to the browser so the connection stays
  // alive for the full 20-40s duration without hitting a proxy timeout.
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const client = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY!,
        });

        let fullText = "";

        const claudeStream = await client.messages.stream({
          model: "claude-sonnet-4-5",
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: [
            { role: "user", content: PAID_PROMPT(statement) },
          ],
        });

        for await (const chunk of claudeStream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            fullText += chunk.delta.text;
            // Send a keep-alive tick so the browser knows we're still working
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "progress" })}\n\n`
              )
            );
          }
        }

        // Parse the completed JSON
        let analysis: PaidAnalysis;
        try {
          analysis = JSON.parse(fullText);
        } catch {
          const match = fullText.match(/\{[\s\S]*\}/);
          if (!match) throw new Error("Failed to parse Claude response as JSON");
          analysis = JSON.parse(match[0]);
        }

        // Persist to Redis
        await redis.set(`session:${sessionId}:paid`, analysis, {
          ex: SESSION_TTL,
        });

        // Send the final result
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "done", analysis })}\n\n`
          )
        );

        // Fire-and-forget email (don't await — stream is done)
        if (email) {
          sendResultsEmail(email, sessionId, analysis).catch((err) =>
            console.error("Failed to send results email:", err)
          );
        }
      } catch (err) {
        console.error("/shortlisted/api/run-analysis error:", err);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: "Analysis failed. Please refresh and try again." })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
