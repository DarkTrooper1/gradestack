import { NextRequest, NextResponse } from "next/server";
import { redis, SESSION_TTL } from "@/lib/shortlisted/redis";
import { runFreeAnalysis } from "@/lib/shortlisted/claude";
import { randomUUID } from "crypto";

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

    await redis.set(
      `session:${sessionId}:meta`,
      { statement, email },
      { ex: SESSION_TTL }
    );

    const freeAnalysis = await runFreeAnalysis(statement);

    await redis.set(`session:${sessionId}:free`, freeAnalysis, {
      ex: SESSION_TTL,
    });

    return NextResponse.json({ sessionId });
  } catch (err) {
    console.error("/shortlisted/api/analyse error:", err);
    const message = err instanceof Error ? err.message : "Analysis failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
