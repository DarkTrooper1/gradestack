import { NextResponse } from "next/server";
import { calculate, lookupQualification } from "@/lib/tariff-lookup";
import type { ParsedQualification } from "@/lib/types";

type CalculateRequestBody = {
  qualifications: ParsedQualification[];
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CalculateRequestBody;

    if (!Array.isArray(body?.qualifications)) {
      return NextResponse.json(
        { error: 'Body must be JSON: { "qualifications": ParsedQualification[] }' },
        { status: 500 },
      );
    }

    const resolved = body.qualifications.map((qualification) =>
      lookupQualification(qualification),
    );
    const result = calculate(resolved);

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

