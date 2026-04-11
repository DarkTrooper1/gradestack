import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import Stripe from "stripe";
import { redis, SESSION_TTL } from "@/lib/shortlisted/redis";
import { runPaidAnalysis } from "@/lib/shortlisted/claude";
import { sendResultsEmail } from "@/lib/shortlisted/email";
import type { PaidAnalysis } from "@/lib/shortlisted/types";

// Claude paid analysis + email can take 20-40s - extend the function timeout
export const maxDuration = 60;

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

    // Respond to Stripe immediately (within its 30s window), then run the
    // heavy Claude work after the response has been sent via after().
    after(async () => {
      try {
        // Retrieve the meta object stored by /api/analyse
        const meta = await redis.get<{ statement: string; email: string }>(
          `session:${sessionId}:meta`
        );
        if (!meta) {
          console.error(`Session meta not found for ${sessionId}`);
          return;
        }

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

        // Store paid result as a plain object - Upstash Redis serialises internally
        await redis.set(`session:${sessionId}:paid`, analysis, {
          ex: SESSION_TTL,
        });

        if (email) {
          try {
            await sendResultsEmail(email, sessionId, analysis);
          } catch (emailErr) {
            console.error("Failed to send results email:", emailErr);
          }
        }
      } catch (err) {
        console.error("Error processing paid analysis:", err);
      }
    });
  }

  return NextResponse.json({ received: true });
}
