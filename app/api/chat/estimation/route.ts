import { NextRequest, NextResponse } from "next/server";
import { getEstimation } from "@/lib/gpt";
import { getComplexity } from "@/lib/gpt";

//import { getEstimation } from "@/lib/claude";
//import { getComplexity } from "@/lib/claude";
import {
  MID_ESTIMATE_SYSTEM_PROMPT,
  EASY_ESTIMATE_SYSTEM_PROMPT,
} from "@/lib/prompts";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { requestData } = await req.json();
    const complexity = await getComplexity(requestData);

    const systemPrompt =
      complexity.complexity === "easy"
        ? EASY_ESTIMATE_SYSTEM_PROMPT
        : MID_ESTIMATE_SYSTEM_PROMPT;

    const estimation = await getEstimation(requestData, systemPrompt);

    return NextResponse.json({ estimation, complexity });
  } catch (error) {
    console.error("Error generating estimation:", error);
    return NextResponse.json(
      { error: "Failed to generate estimation" },
      { status: 500 }
    );
  }
}
