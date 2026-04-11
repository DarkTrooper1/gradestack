import OpenAI from "openai";
import { NextResponse } from "next/server";
import { PARSER_SYSTEM_PROMPT } from "@/lib/prompts";

type ParseRequestBody = {
  input: string;
};

function extractJson(text: string): string {
  const trimmed = text.trim();

  // Common failure mode: fenced code blocks
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return unfenced;
}

export async function POST(req: Request) {
  console.log("API hit, key exists:", !!process.env.OPENAI_API_KEY);
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 },
      );
    }

    let body: ParseRequestBody;
    try {
      body = (await req.json()) as ParseRequestBody;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 500 });
    }

    const input = typeof body?.input === "string" ? body.input.trim() : "";
    if (!input) {
      return NextResponse.json(
        { error: 'Body must be JSON: { "input": string }' },
        { status: 500 },
      );
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: PARSER_SYSTEM_PROMPT },
        { role: "user", content: input },
      ],
    });

    const content = completion.choices?.[0]?.message?.content ?? "";
    if (!content) {
      return NextResponse.json(
        { error: "OpenAI returned an empty response" },
        { status: 500 },
      );
    }

    const jsonText = extractJson(content);

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse JSON from model response" },
        { status: 500 },
      );
    }

    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

