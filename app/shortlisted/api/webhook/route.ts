import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { redis, SESSION_TTL } from "@/lib/shortlisted/redis";
import { runPaidAnalysis } from "@/lib/shortlisted/claude";
import { sendResultsEmail } from "@/lib/shortlisted/email";
import type { PaidAnalysis } from "@/lib/shortlisted/types";

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
    const email = session.metadata?.email ?? session.customer_email ?? "";

    if (!sessionId) {
      console.error("No sessionId in Stripe metadata");
      return NextResponse.json({ received: true });
    }

    try {
      const metaRaw = await redis.get<string>(`session:${sessionId}:meta`);
      if (!metaRaw) {
        console.error(`Session meta not found for ${sessionId}`);
        return NextResponse.json({ received: true });
      }

      const meta =
        typeof metaRaw === "string" ? JSON.parse(metaRaw) : metaRaw;
      const statement: string = meta.statement;

      const rawJson = await runPaidAnalysis(statement);
      let analysis: PaidAnalysis;
      try {
        analysis = JSON.parse(rawJson);
      } catch {
        const match = rawJson.match(/\{[\s\S]*\}/);
        if (!match)
          throw new Error("Failed to parse paid Claude response as JSON");
        analysis = JSON.parse(match[0]);
      }

      await redis.set(
        `session:${sessionId}:paid`,
        JSON.stringify(analysis),
        { ex: SESSION_TTL }
      );

      if (email) {
        try {
          await sendResultsEmail(email, sessionId, analysis);
        } catch (emailErr) {
          console.error("Failed to send results email:", emailErr);
        }
      }
    } catch (err) {
      console.error("Error processing paid analysis:", err);
      return NextResponse.json({ received: true });
    }
  }

  return NextResponse.json({ received: true });
}
