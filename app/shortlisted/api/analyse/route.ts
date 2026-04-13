import { NextRequest, NextResponse } from "next/server";
import { redis, SESSION_TTL } from "@/lib/shortlisted/redis";
import { runFreeAnalysis, runPaidAnalysis } from "@/lib/shortlisted/claude";
import { randomUUID } from "crypto";

// Both Claude calls run in parallel — total time is ~max(free, paid), not free+paid.
// Paid analysis with 2048 max_tokens typically completes in 20-35s.
// Each call retries once internally on a JSON parse failure before throwing.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { statement, email } = body as { statement: string; email: string };

    if (!statement || typeof statement !== "string") {
      return NextResponse.json(
        { error: "statement is required" },
        { status: 400 }
      );
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "valid email is required" },
        { status: 400 }
      );
    }
    if (statement.length < 100) {
      return NextResponse.json(
        { error: "statement must be at least 100 characters" },
        { status: 400 }
      );
    }
    if (statement.length > 4000) {
      return NextResponse.json(
        { error: "statement must be 4000 characters or fewer" },
        { status: 400 }
      );
    }

    const sessionId = randomUUID();

    // Persist meta first so webhook/results routes can always find it
    await redis.set(
      `session:${sessionId}:meta`,
      { statement, email },
      { ex: SESSION_TTL }
    );

    // Run both analyses in parallel — each retries once internally on parse failure
    const [freeAnalysis, paidAnalysis] = await Promise.all([
      runFreeAnalysis(statement),
      runPaidAnalysis(statement),
    ]);

    // Store free result and locked paid result in parallel.
    // Paid data is wrapped in a locked envelope — the results route strips it
    // only after paid_confirmed is written by the webhook.
    await Promise.all([
      redis.set(`session:${sessionId}:free`, freeAnalysis, { ex: SESSION_TTL }),
      redis.set(
        `session:${sessionId}:paid`,
        { locked: true, data: paidAnalysis },
        { ex: SESSION_TTL }
      ),
    ]);

    return NextResponse.json({ sessionId });
  } catch (err) {
    console.error("/shortlisted/api/analyse error:", err);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
