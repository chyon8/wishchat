import { GoogleGenerativeAI } from "@google/generative-ai";

export async function geminiPlaygroundResponse(
  answers: Answer[],
  userPrompt: string,
  model: string
) {
  // Gemini 모델 이름 매핑
  const modelMap: { [key: string]: string } = {
    "Gemini 2.0 Flash": "gemini-2.0-flash",
    "Gemini 2.0 Flash Lite": "gemini-2.0-flash-lite",
  };

  const geminiModel = modelMap[model] || "gemini-2.0-flash";

  const gemini = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
  const modelInstance = gemini.getGenerativeModel({ model: geminiModel });

  const prompt = `${userPrompt}\n\ninput: ${JSON.stringify(
    answers,
    null,
    2
  )}\n응답을 생성하세요.`;

  const result = await modelInstance.generateContent(prompt);
  const response = await result.response;

  return response.text();
}
