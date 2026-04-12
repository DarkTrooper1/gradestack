import { NextRequest, NextResponse } from "next/server";
import { redis, SESSION_TTL } from "@/lib/shortlisted/redis";
import { runFreeAnalysis, runPaidAnalysis } from "@/lib/shortlisted/claude";
import { randomUUID } from "crypto";
import type { FreeAnalysis, PaidAnalysis } from "@/lib/shortlisted/types";

// Both Claude calls run in parallel — total time is ~max(free, paid), not free+paid.
// Paid analysis with 2048 max_tokens typically completes in 20-35s.
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

    // Run both analyses in parallel — paid takes longer so this saves ~10s
    const [freeRaw, paidRaw] = await Promise.all([
      runFreeAnalysis(statement),
      runPaidAnalysis(statement),
    ]);

    // Parse free result
    let freeAnalysis: FreeAnalysis;
    try {
      freeAnalysis = JSON.parse(freeRaw);
    } catch {
      const match = freeRaw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Failed to parse free Claude response as JSON");
      freeAnalysis = JSON.parse(match[0]);
    }

    // Parse paid result
    let paidAnalysis: PaidAnalysis;
    try {
      paidAnalysis = JSON.parse(paidRaw);
    } catch {
      const match = paidRaw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Failed to parse paid Claude response as JSON");
      paidAnalysis = JSON.parse(match[0]);
    }

    // Store free result and locked paid result in parallel
    await Promise.all([
      redis.set(`session:${sessionId}:free`, freeAnalysis, { ex: SESSION_TTL }),
      // Paid data is stored immediately but wrapped in a locked envelope.
      // The results route unlocks it only after paid_confirmed is set by the webhook.
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
