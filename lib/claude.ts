import Anthropic from "@anthropic-ai/sdk";
import {
  validateComplexityResponse,
  validateFirstQuestion,
  //validateEstimationResponse,
  validateQuestionResponse,
  validateSummaryResponse,
} from "./valiidators";
import {
  COMPLEXITY_SYSTEM_PROMPT,
  FIRST_QUESTION_PROMPT,
  QUESTION_SYSTEM_PROMPT,
  SUMMARY_SYSTEM_PROMPT,
} from "./prompts";

interface ResponseWithContent {
  content?: { text: string }[];
  text?: string;
  // SummaryResponse의 필드들을 포함
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
  complexity?: string;
  reasonComplexity?: string;
  numOfQuestions?: number;
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

async function retryOperation<T extends ResponseWithContent>(
  operation: () => Promise<T>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validator: (response: any) => response is T,
  maxRetries: number = 3
): Promise<T> {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await operation();
      const parsedResponse = JSON.parse(
        typeof response === "string"
          ? response
          : response.content?.[0]?.text || ""
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
      model: "claude-3-5-sonnet-20241022",
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
    return response as ResponseWithContent;
  }, validateQuestionResponse);
}

export async function getSummary(answers: Answer[]) {
  return retryOperation(async () => {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      temperature: 0.7,
      system: SUMMARY_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `모든 답변: ${JSON.stringify(answers, null, 2)}
            최종 결과를 정리하고 추가사항을 제안해주세요.`,
        },
      ],
    });
    return response as ResponseWithContent;
  }, validateSummaryResponse);
}

// 견적 계산

/*
export async function getEstimation(answers: Answer[]) {
  return retryOperation(async () => {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      temperature: 0.7,
      system: ESTIMATE_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `모든 답변: ${JSON.stringify(answers, null, 2)}
            최종 결과를 정리해주세요.`,
        },
      ],
    });
    return response as ResponseWithContent;
  }, validateEstimationResponse);
}
*/

export async function getComplexity(answers: Answer[]) {
  return retryOperation(async () => {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      temperature: 0.7,
      system: COMPLEXITY_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `모든 답변: ${JSON.stringify(answers, null, 2)}
           복잡도를 평가해주세요.`,
        },
      ],
    });
    return response as ResponseWithContent;
  }, validateComplexityResponse);
}

export async function getFirstQuestion(answers: Answer[]) {
  return retryOperation(async () => {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      temperature: 0.5,
      system: FIRST_QUESTION_PROMPT,
      messages: [
        {
          role: "user",
          content: `모든 답변: ${JSON.stringify(answers, null, 2)}
            질문개수와 후속질문을 생성해주세요.`,
        },
      ],
    });
    return response as ResponseWithContent;
  }, validateFirstQuestion);
}
