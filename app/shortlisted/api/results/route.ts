import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/shortlisted/redis";
import type { FreeAnalysis, PaidAnalysis } from "@/lib/shortlisted/types";

type LockedPaid = { locked: true; data: PaidAnalysis };
type UnlockedPaid = PaidAnalysis;
type StoredPaid = LockedPaid | UnlockedPaid;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    const [free, storedPaid, confirmed] = await Promise.all([
      redis.get<FreeAnalysis>(`session:${id}:free`),
      redis.get<StoredPaid>(`session:${id}:paid`),
      redis.get<boolean>(`session:${id}:paid_confirmed`),
    ]);

    if (!free && !storedPaid) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Resolve paid: unlock if confirmed, otherwise return null to the client
    let paid: PaidAnalysis | null = null;
    if (storedPaid) {
      if ("locked" in storedPaid && storedPaid.locked) {
        // Pre-computed but awaiting payment
        paid = confirmed ? storedPaid.data : null;
      } else {
        // Already stored without lock envelope (legacy / direct write)
        paid = storedPaid as UnlockedPaid;
      }
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
