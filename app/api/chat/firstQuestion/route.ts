import { NextRequest, NextResponse } from "next/server";
import { getNextQuestion } from "@/lib/claude";
//import { getNextQuestion } from "@/lib/gpt";
import { getNumOfQuestions } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const { answers } = await req.json();

    const numOfQuestions = await getNumOfQuestions(answers);

    const question = await getNextQuestion(answers);
    return NextResponse.json({ question, numOfQuestions });
  } catch (error) {
    console.error("Error generating question:", error);
    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 }
    );
  }
}
