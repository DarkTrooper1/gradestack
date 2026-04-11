import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { email, total_points, tier_label, tier_description, quick_wins } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Save to audience
    await resend.contacts.create({
      email,
      unsubscribed: false,
      audienceId: process.env.RESEND_AUDIENCE_ID!,
    });

    // Send results email
    await resend.emails.send({
      // Requires gradestack.co.uk verified in Resend dashboard → Domains before this will work.
      from: "Gradestack <results@gradestack.co.uk>",
      to: email,
      subject: `Your UCAS results: ${total_points} points — ${tier_label}`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; background: #f5f3ee; color: #1a1a2e;">
          <div style="background: #ffffff; border: 1px solid #e8e6e0; border-radius: 16px; padding: 32px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:24px;">
              <div style="width:28px;height:28px;background:#5248e6;border-radius:7px;display:flex;align-items:center;justify-content:center;">
                <svg width="14" height="14" viewBox="0 0 64 64"><path d="M12 50 L32 14 L52 50" fill="none" stroke="white" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <span style="font-size:15px;font-weight:700;color:#1a1a2e;">Gradestack</span>
            </div>
            <h1 style="font-size: 48px; font-weight: 800; margin: 0 0 8px; color: #5248e6;">${total_points} pts</h1>
            <p style="font-size: 16px; color: #534ab7; margin: 0 0 24px;">${tier_label}</p>
            <p style="font-size: 15px; color: #1a1a2e; line-height: 1.6; margin: 0 0 32px;">${tier_description}</p>
            <h2 style="font-size: 13px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #9b99b0; margin: 0 0 16px;">Your Quick Wins</h2>
            ${quick_wins.map((win: { title: string; description: string; points_gain: number }) => `
              <div style="background: #ffffff; border: 1px solid #e8e6e0; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <p style="font-size: 14px; font-weight: 600; color: #1a1a2e; margin: 0 0 4px;">${win.title}</p>
                    <p style="font-size: 14px; color: #6b6b80; margin: 0;">${win.description}</p>
                  </div>
                  ${win.points_gain > 0 ? `<span style="font-size: 12px; font-weight: 700; color: #3b6d11; background: #eaf3de; border: 1px solid #c0dd97; border-radius: 8px; padding: 4px 10px; white-space: nowrap; margin-left: 12px;">+${win.points_gain} pts</span>` : ""}
                </div>
              </div>
            `).join("")}
            <p style="font-size: 13px; color: #9b99b0; margin-top: 32px;">Calculated with Gradestack · gradestack.co.uk</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
