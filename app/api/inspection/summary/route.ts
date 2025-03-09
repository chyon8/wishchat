import { NextRequest, NextResponse } from "next/server";
//import { getSummary } from "@/lib/claude";
import { getSummaryInspection } from "@/lib/gpt";
//import { getSummaryInspection } from "@/lib/claude";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { answers } = await req.json();
    const summary = await getSummaryInspection(answers);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
