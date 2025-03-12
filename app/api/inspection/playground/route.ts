// /app/api/inspection/playground/route.ts 수정
import { NextRequest, NextResponse } from "next/server";
import { playgroundResponse } from "@/lib/claude";
import { gptPlaygroundResponse } from "@/lib/gpt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { answers, userPrompt, model } = body;

    if (!Array.isArray(answers)) {
      return NextResponse.json(
        { error: "유효한 답변 데이터가 필요합니다." },
        { status: 400 }
      );
    }

    // userPrompt가 없는 경우 기본값 사용
    const systemPrompt = userPrompt || "";

    let result;

    // 모델 유형에 따라 다른 API 호출
    if (model && model.startsWith("GPT")) {
      result = await gptPlaygroundResponse(answers, systemPrompt, model);
    } else {
      result = await playgroundResponse(answers, systemPrompt, model);
    }

    // 순수 텍스트로 반환
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Playground API 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
