import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { redis, SESSION_TTL } from "@/lib/shortlisted/redis";
import { runFreeAnalysis } from "@/lib/shortlisted/claude";
import { Resend } from "resend";
import { randomUUID } from "crypto";

export const maxDuration = 60;

// Rate limit: 3 submissions per IP per hour
let _ratelimit: Ratelimit | null = null;
function getRatelimit() {
  if (!_ratelimit) {
    _ratelimit = new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      }),
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      prefix: "shortlisted:rl",
    });
  }
  return _ratelimit;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = await getRatelimit().limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { statement, email, optIn = false } = body as {
      statement: string;
      email: string;
      optIn?: boolean;
    };

    // Validation
    if (!statement || typeof statement !== "string") {
      return NextResponse.json(
        { error: "statement is required" },
        { status: 400 }
      );
    }
    if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }
    if (statement.length < 100) {
      return NextResponse.json(
        { error: "Your statement must be at least 100 characters." },
        { status: 400 }
      );
    }
    if (statement.length > 4000) {
      return NextResponse.json(
        { error: "Your statement must be 4000 characters or fewer." },
        { status: 400 }
      );
    }

    const sessionId = randomUUID();

    // Store meta including opt-in preference
    await redis.set(
      `session:${sessionId}:meta`,
      { statement, email, optIn },
      { ex: SESSION_TTL }
    );

    // Add to Resend audience if opted in
    if (optIn && process.env.RESEND_API_KEY && process.env.RESEND_AUDIENCE_ID) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.contacts.create({
          audienceId: process.env.RESEND_AUDIENCE_ID,
          email,
          unsubscribed: false,
        });
      } catch (err) {
        // Non-fatal — log and continue
        console.error("Failed to add contact to Resend audience:", err);
      }
    }

    const freeAnalysis = await runFreeAnalysis(statement);

    await redis.set(`session:${sessionId}:free`, freeAnalysis, {
      ex: SESSION_TTL,
    });

    return NextResponse.json({ sessionId });
  } catch (err) {
    console.error("/shortlisted/api/analyse error:", err);
    const message =
      err instanceof Error ? err.message : "Analysis failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
