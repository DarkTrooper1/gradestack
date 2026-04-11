import { Resend } from "resend";
import type { PaidAnalysis } from "./types";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}

const CRITERIA_LABELS: Record<string, string> = {
  passion_motivation: "Passion & Motivation",
  academic_potential: "Academic Potential",
  relevant_experience: "Relevant Experience",
  writing_quality: "Writing Quality",
  course_suitability: "Course Suitability",
};

export async function sendResultsEmail(
  email: string,
  sessionId: string,
  analysis: PaidAnalysis
): Promise<void> {
  const criteriaRows = Object.entries(analysis.criteria)
    .map(
      ([key, crit]) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0e8e4; font-weight: 600;">${CRITERIA_LABELS[key] ?? key}</td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0e8e4; text-align: right; color: #C24E2A; font-weight: 700;">${crit.score}/10</td>
    </tr>`
    )
    .join("");

  const rewriteRows = analysis.rewrite_suggestions
    .map(
      (s) => `
    <div style="margin-bottom: 24px; padding: 16px; background: #fdf8f6; border-left: 3px solid #C24E2A; border-radius: 4px;">
      <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #C24E2A; font-weight: 600;">${s.criterion}</p>
      <p style="margin: 0 0 8px; color: #666; font-style: italic; font-size: 14px;">"${s.original}"</p>
      <p style="margin: 0 0 8px; font-size: 14px;"><strong>Rewrite:</strong> ${s.rewrite}</p>
      <p style="margin: 0; font-size: 13px; color: #666;">${s.reason}</p>
    </div>`
    )
    .join("");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://gradestack.co.uk";

  await getResend().emails.send({
    from: "Shortlisted <results@gradestack.co.uk>",
    to: email,
    subject: `Your UCAS personal statement results - ${analysis.overall_score}/100`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin: 0; padding: 0; background: #f9f5f2; font-family: Georgia, serif; color: #1a1a1a;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="font-size: 28px; font-weight: 700; letter-spacing: -0.5px; margin: 0 0 8px;">Shortlisted</h1>
      <p style="margin: 0; color: #666; font-size: 15px;">Your UCAS Personal Statement Analysis</p>
    </div>

    <div style="background: white; border-radius: 12px; padding: 32px; margin-bottom: 24px; text-align: center;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 0.05em;">Overall Score</p>
      <p style="margin: 0 0 16px; font-size: 64px; font-weight: 700; color: #C24E2A; line-height: 1;">${analysis.overall_score}</p>
      <p style="margin: 0 0 16px; font-size: 14px; color: #666;">out of 100</p>
      <p style="margin: 0 0 12px; font-size: 16px; font-weight: 600;">${analysis.overall_verdict}</p>
      <p style="margin: 0; font-size: 14px; color: #555; line-height: 1.6;">${analysis.overall_summary}</p>
    </div>

    <div style="background: white; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
      <h2 style="margin: 0 0 20px; font-size: 18px; font-weight: 700;">Criterion Scores</h2>
      <table style="width: 100%; border-collapse: collapse;">${criteriaRows}</table>
    </div>

    ${
      analysis.rewrite_suggestions.length > 0
        ? `
    <div style="background: white; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
      <h2 style="margin: 0 0 20px; font-size: 18px; font-weight: 700;">Rewrite Suggestions</h2>
      ${rewriteRows}
    </div>`
        : ""
    }

    <div style="text-align: center; padding: 24px; color: #999; font-size: 13px;">
      <p style="margin: 0 0 8px;">View your full annotated results at:</p>
      <a href="${baseUrl}/shortlisted/results?id=${sessionId}" style="color: #C24E2A;">${baseUrl}/shortlisted/results?id=${sessionId}</a>
      <p style="margin: 16px 0 0; font-size: 12px;">Results are stored for 48 hours.</p>
    </div>

  </div>
</body>
</html>`,
  });
}
