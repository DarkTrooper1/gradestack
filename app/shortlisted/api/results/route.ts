import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/shortlisted/redis";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    const [freeRaw, paidRaw] = await Promise.all([
      redis.get<string>(`session:${id}:free`),
      redis.get<string>(`session:${id}:paid`),
    ]);

    const free = freeRaw
      ? typeof freeRaw === "string"
        ? JSON.parse(freeRaw)
        : freeRaw
      : null;

    const paid = paidRaw
      ? typeof paidRaw === "string"
        ? JSON.parse(paidRaw)
        : paidRaw
      : null;

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
