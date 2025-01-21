import { NextRequest, NextResponse } from "next/server";
import { getEstimation } from "@/lib/gpt";
//import { getEstimation } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const { requestData } = await req.json();
    const estimation = await getEstimation(requestData);
    return NextResponse.json({ estimation });
  } catch (error) {
    console.error("Error generating estimation:", error);
    return NextResponse.json(
      { error: "Failed to generate estimation" },
      { status: 500 }
    );
  }
}
