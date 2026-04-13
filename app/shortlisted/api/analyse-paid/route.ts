import { NextRequest, NextResponse } from "next/server";
import { redis, SESSION_TTL } from "@/lib/shortlisted/redis";
import { runPaidAnalysis } from "@/lib/shortlisted/claude";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = (await req.json()) as { sessionId: string };

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    const meta = await redis.get<{ statement: string; email: string }>(
      `session:${sessionId}:meta`
    );
    if (!meta) {
      return NextResponse.json(
        { error: "Session not found or expired" },
        { status: 404 }
      );
    }

    const paidAnalysis = await runPaidAnalysis(meta.statement);

    await redis.set(
      `session:${sessionId}:paid`,
      { locked: true, data: paidAnalysis },
      { ex: SESSION_TTL }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("/shortlisted/api/analyse-paid error:", err);
    const message = err instanceof Error ? err.message : "Paid analysis failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
