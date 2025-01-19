export function validateQuestionResponse(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any
): response is QuestionResponse {
  if (!response || typeof response !== "object") return false;
  if (typeof response.text !== "string") return false;
  if (!["text", "multiple-choice"].includes(response.type)) return false;
  if (response.type === "multiple-choice") {
    if (!Array.isArray(response.options)) return false;
    if (response.options.length !== 5) return false;
    if (!response.options.includes("잘 모르겠어요")) return false;
  }

  return true;
}

export function validateSummaryResponse(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any
): response is SummaryResponse {
  if (!response || typeof response !== "object") return false;
  if (typeof response.overview !== "string") return false;
  if (!Array.isArray(response.requirements)) return false;
  if (typeof response.environment !== "string") return false;
  if (!Array.isArray(response.features)) return false;

  return true;
}
/*
  return response.features.every(
    (feature: any) =>
      typeof feature.name === "string" &&
      typeof feature.description === "string"
  );
}
*/
