import { NextRequest, NextResponse } from "next/server";
import { getSummary } from "@/lib/claude";
//import { getSummary } from "@/lib/gpt";

export async function POST(req: NextRequest) {
  try {
    const { answers } = await req.json();
    const summary = await getSummary(answers);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
