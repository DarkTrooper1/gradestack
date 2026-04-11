import { NextRequest, NextResponse } from "next/server";
import { redis, SESSION_TTL } from "@/lib/shortlisted/redis";
import { runFreeAnalysis } from "@/lib/shortlisted/claude";
import { randomUUID } from "crypto";
import type { FreeAnalysis } from "@/lib/shortlisted/types";

// Claude API can spike past the default 10s/15s timeout
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

    // Store meta as a plain object - Upstash Redis serialises internally
    await redis.set(
      `session:${sessionId}:meta`,
      { statement, email },
      { ex: SESSION_TTL }
    );

    const rawJson = await runFreeAnalysis(statement);
    let analysis: FreeAnalysis;
    try {
      analysis = JSON.parse(rawJson);
    } catch {
      const match = rawJson.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Failed to parse Claude response as JSON");
      analysis = JSON.parse(match[0]);
    }

    await redis.set(`session:${sessionId}:free`, analysis, {
      ex: SESSION_TTL,
    });

    return NextResponse.json({ sessionId });
  } catch (err) {
    console.error("/shortlisted/api/analyse error:", err);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
