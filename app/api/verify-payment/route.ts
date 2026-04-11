import Stripe from 'stripe';

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const { session_id } = await req.json();
  const session = await stripe.checkout.sessions.retrieve(session_id);
  return Response.json({
    paid: session.payment_status === 'paid',
    total_points: Number(session.metadata?.total_points ?? 0),
  });
}
