export function validateQuestionResponse(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any
): response is QuestionResponse {
  if (!response || typeof response !== "object") return false;
  if (typeof response.text !== "string") return false;
  if (!["text", "multiple-choice"].includes(response.type)) return false;
  if (response.type === "multiple-choice") {
    if (!Array.isArray(response.options)) return false;
    if (response.options.length !== 6) return false;
    if (!response.options.includes("잘 모르겠어요")) return false;
  }

  return true;
}

const validWorkRangeValues = ["기획", "디자인", "개발"];
export function validateSummaryResponse(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any
): response is SummaryResponse {
  if (!response || typeof response !== "object") return false;

  const allowedKeys = [
    "overview",
    "requirements",
    "environment",
    "features",
    "workRange",
    "additional",
    "suggestion",
  ];

  // Object.keys()로 실제 키값들을 가져와서 허용된 키값 외의 것이 있는지 검사
  const actualKeys = Object.keys(response);
  if (actualKeys.some((key) => !allowedKeys.includes(key))) return false;
  if (allowedKeys.some((key) => !actualKeys.includes(key))) return false;

  if (typeof response.overview !== "string") return false;
  if (typeof response.suggestion !== "string") return false;
  if (!Array.isArray(response.requirements)) return false;
  if (typeof response.environment !== "string") return false;
  if (!Array.isArray(response.features)) return false;

  // workRange 검증
  if (!Array.isArray(response.workRange)) return false;
  if (response.workRange.length === 0) return false; // workRange가 비어있으면 false
  for (const value of response.workRange) {
    if (!validWorkRangeValues.includes(value)) return false; // 유효하지 않은 값이 포함되어 있으면 false
  }

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

export function validateEstimationResponse(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any
): response is EstimationResponse {
  if (!response || typeof response !== "object") return false;
  if (typeof response.frontend !== "number") return false;
  if (typeof response.backend !== "number") return false;
  if (typeof response.pm !== "number") return false;
  if (typeof response.planner !== "number") return false;
  if (typeof response.designer !== "number") return false;

  return true;
}

const validComplexityValues = ["mid", "easy"];

export function validateComplexityResponse(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any
): response is ComplexityResponse {
  if (!response || typeof response !== "object") return false;
  if (
    typeof response.complexity !== "string" ||
    !validComplexityValues.includes(response.complexity)
  ) {
    return false;
  }
  if (typeof response.reasonComplexity !== "string") return false;

  return true;
}

export function validateFirstQuestion(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any
): response is FirstQuestion {
  if (!response || typeof response !== "object") return false;
  if (typeof response.numOfQuestions !== "number") return false;
  if (typeof response.text !== "string") return false;
  if (!["text", "multiple-choice"].includes(response.type)) return false;
  if (response.type === "multiple-choice") {
    if (!Array.isArray(response.options)) return false;
    if (response.options.length !== 6) return false;
    if (!response.options.includes("잘 모르겠어요")) return false;
  }

  return true;
}
