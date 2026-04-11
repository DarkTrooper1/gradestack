import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/shortlisted/redis";
import type { FreeAnalysis, PaidAnalysis } from "@/lib/shortlisted/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    const [free, paid] = await Promise.all([
      redis.get<FreeAnalysis>(`session:${id}:free`),
      redis.get<PaidAnalysis>(`session:${id}:paid`),
    ]);

    if (!free && !paid) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ free, paid });
  } catch (err) {
    console.error("/shortlisted/api/results error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve results" },
      { status: 500 }
    );
  }
}
