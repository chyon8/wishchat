import Anthropic from "@anthropic-ai/sdk";
import {
  validateQuestionResponse,
  validateSummaryResponse,
} from "./valiidators";
import { QUESTION_SYSTEM_PROMPT, SUMMARY_SYSTEM_PROMPT } from "./prompts";

export const dynamic = "force-dynamic";
export const runtime = "edge";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

async function retryOperation<T>(
  operation: () => Promise<T>,
  validator: (response: any) => response is T,
  maxRetries: number = 3
): Promise<T> {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await operation();
      const parsedResponse = JSON.parse(
        typeof response === "string" ? response : response.content[0].text
      );

      if (!validator(parsedResponse)) {
        if (retries === maxRetries - 1) {
          throw new Error("Invalid response format after max retries");
        }
        retries++;
        continue;
      }

      return parsedResponse;
    } catch (error) {
      if (retries === maxRetries - 1) {
        throw error;
      }
      retries++;
    }
  }

  throw new Error("Failed after max retries");
}

export async function getNextQuestion(answers: Answer[]) {
  return retryOperation(async () => {
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1024,
      temperature: 0.7,
      system: QUESTION_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `현재까지의 답변: ${JSON.stringify(answers, null, 2)}
            다음 질문을 생성해주세요.`,
        },
      ],
    });
    return response;
  }, validateQuestionResponse);
}

export async function getSummary(answers: Answer[]) {
  return retryOperation(async () => {
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 2048,
      temperature: 0.7,
      system: SUMMARY_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `모든 답변: ${JSON.stringify(answers, null, 2)}
            최종 결과를 정리해주세요.`,
        },
      ],
    });
    return response;
  }, validateSummaryResponse);
}
