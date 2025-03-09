import OpenAI from "openai";
import {
  validateComplexityResponse,
  validateEstimationResponse,
  validateQuestionResponse,
  validateSummaryResponse,
} from "./valiidators";
import {
  QUESTION_SYSTEM_PROMPT,
  SUMMARY_SYSTEM_PROMPT,
  COMPLEXITY_SYSTEM_PROMPT,
  ESTIMATE_FACTOR_SYSTEM,
  INSPECTION_SUMMARY_SYSTEM_PROMPT,
} from "./prompts";

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
  complexity?: string;
  reasonComplexity?: string;
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

export async function getEstimation(answers: Answer[], systemPrompt: string) {
  return retryOperation<ResponseWithContent>(async () => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 2048,
      messages: [
        {
          role: "system",
          content: systemPrompt,
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

export async function getComplexity(answers: Answer[]) {
  return retryOperation<ResponseWithContent>(async () => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 2048,
      messages: [
        {
          role: "system",
          content: COMPLEXITY_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `모든 답변: ${JSON.stringify(answers, null, 2)}
             프로젝트의 복잡도를 평가해주세요.`,
        },
      ],
    });
    return response as unknown as OpenAIResponse;
  }, validateComplexityResponse);
}

export async function getEstimateFactors(answers: Answer[]): Promise<string> {
  const response = (await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.7,
    max_tokens: 2048,
    messages: [
      {
        role: "system",
        content: ESTIMATE_FACTOR_SYSTEM,
      },
      {
        role: "user",
        content: `모든 답변: ${JSON.stringify(answers, null, 2)}
             견적 변동 요소를 설명하세요.`,
      },
    ],
  })) as unknown as OpenAIResponse;

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("Failed to get estimate factors from OpenAI");
  }

  return content;
}

/*
export async function getSummaryInspection(answers: Answer[]) {
  const response = await openai.chat.completions.create({
    model: "o3-mini",
    reasoning_effort: "medium",
    messages: [
      {
        role: "system",
        content: INSPECTION_SUMMARY_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: `모든 답변: ${JSON.stringify(answers, null, 2)}
                최종 결과를 정리해주세요.`,
      },
    ],
  });
  return response.choices[0].message.content;
}
*/

export async function getSummaryInspection(answers: Answer[]) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.7,
    max_tokens: 2048,
    messages: [
      {
        role: "system",
        content: INSPECTION_SUMMARY_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: `모든 답변: ${JSON.stringify(answers, null, 2)}
                최종 결과를 정리해주세요.`,
      },
    ],
  });
  return response.choices[0].message.content;
}
