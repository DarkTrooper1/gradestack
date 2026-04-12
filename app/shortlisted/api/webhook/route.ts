import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { redis, SESSION_TTL } from "@/lib/shortlisted/redis";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-03-25.dahlia",
  });
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await req.text();
    event = getStripe().webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const sessionId = session.metadata?.sessionId;

    if (!sessionId) {
      console.error("No sessionId in Stripe metadata");
      return NextResponse.json({ received: true });
    }

    // Only write the payment confirmation flag — no Claude calls here.
    // The browser will call /shortlisted/api/run-analysis after redirect,
    // which checks this flag before running the paid Claude analysis.
    await redis.set(`session:${sessionId}:paid_confirmed`, true, {
      ex: SESSION_TTL,
    });

    console.log(`Payment confirmed for session ${sessionId}`);
  }

  return NextResponse.json({ received: true });
}
