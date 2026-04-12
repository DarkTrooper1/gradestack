import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { redis } from "@/lib/shortlisted/redis";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-03-25.dahlia",
  });
}

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

    const email: string = meta.email ?? "";
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      customer_email: email || undefined,
      metadata: { sessionId, email },
      success_url: `${baseUrl}/shortlisted/results?id=${sessionId}&payment=success`,
      cancel_url: `${baseUrl}/shortlisted/results?id=${sessionId}`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("/shortlisted/api/checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
