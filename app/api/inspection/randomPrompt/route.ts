import { NextResponse } from "next/server";
import { createRandomPrompt } from "@/lib/gpt";

export const runtime = "edge";

export async function POST() {
  try {
    const result = await createRandomPrompt();

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error generating prompt", error);
    return NextResponse.json(
      { error: "Failed to generate prompt" },
      { status: 500 }
    );
  }
}
