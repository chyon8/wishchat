import OpenAI from "openai";
import {
  validateEstimationResponse,
  validateQuestionResponse,
  validateSummaryResponse,
} from "./valiidators";
import {
  ESTIMATE_SYSTEM_PROMPT,
  QUESTION_SYSTEM_PROMPT,
  SUMMARY_SYSTEM_PROMPT,
} from "./prompts";

export const dynamic = "force-dynamic";
export const runtime = "edge";

// Interface for the validated/parsed response
interface ResponseWithContent {
  content?: { text: string }[];
  text?: string;
  overview?: string;
  requirements?: string[];
  environment?: string;
  features?: string[];
  frontend?: number;
  backend?: number;
  designer?: number;
  planner?: number;
  pm?: number;
  reason?: string;
}

// Interface for raw OpenAI API response
interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
    index: number;
    finish_reason: string;
  }[];
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

async function retryOperation<T extends ResponseWithContent>(
  operation: () => Promise<OpenAIResponse>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validator: (response: any) => response is T,
  maxRetries: number = 3
): Promise<T> {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await operation();
      const content = response.choices[0]?.message?.content || "";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let parsedResponse: any;
      try {
        parsedResponse = JSON.parse(content);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        if (retries === maxRetries - 1) {
          throw new Error("Failed to parse response as JSON");
        }
        retries++;
        continue;
      }

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
  return retryOperation<ResponseWithContent>(async () => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: QUESTION_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `현재까지의 답변: ${JSON.stringify(answers, null, 2)}
              다음 질문을 생성해주세요.`,
        },
      ],
    });
    return response as unknown as OpenAIResponse;
  }, validateQuestionResponse);
}

export async function getSummary(answers: Answer[]) {
  return retryOperation<ResponseWithContent>(async () => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 2048,
      messages: [
        {
          role: "system",
          content: SUMMARY_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `모든 답변: ${JSON.stringify(answers, null, 2)}
              최종 결과를 정리해주세요.`,
        },
      ],
    });
    return response as unknown as OpenAIResponse;
  }, validateSummaryResponse);
}

// 견적 계산

/*

export async function getEstimation(answers: Answer[]) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 2048,
      messages: [
        {
          role: "system",
          content: ESTIMATE_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `모든 답변: ${JSON.stringify(answers, null, 2)}
          기간과 견적을 산정해주세요.`,
        },
      ],
    });

    return (
      response?.choices[0]?.message?.content || "결과를 생성할 수 없습니다."
    );
  } catch (error) {
    console.error("Error fetching estimation:", error);
    return "에러가 발생했습니다. 다시 시도해주세요.";
  }
}
*/

export async function getEstimation(answers: Answer[]) {
  return retryOperation<ResponseWithContent>(async () => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 2048,
      messages: [
        {
          role: "system",
          content: ESTIMATE_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `모든 답변: ${JSON.stringify(answers, null, 2)}
             기간과 견적을 산정해주세요.`,
        },
      ],
    });
    return response as unknown as OpenAIResponse;
  }, validateEstimationResponse);
}
