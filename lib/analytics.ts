//import { sendGAEvent } from "@next/third-parties/google";

export const sendGAEvent = (
  eventName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eventParams: Record<string, any>
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, eventParams);
  } else {
    console.error(" GA event not sent: gtag is not initialized");
  }
};

export const trackStep = (
  stepNumber: number,
  questionType: string,
  questionText: string
) => {
  sendGAEvent("step_complete", {
    step_number: stepNumber,
    question_type: questionType,
    question_text: questionText,
  });
};

export const trackQuestionResponse = (
  stepNumber: number,
  responseType: "text" | "multiple-choice",
  questionText: string
) => {
  sendGAEvent("question_response", {
    step_number: stepNumber,
    response_type: responseType,
    question_text: questionText,
  });
};

export const trackSummaryView = () => {
  sendGAEvent("summary_view", {
    timestamp: new Date().toISOString(),
  });
};

export const trackEstimateView = (estimateAmount: number) => {
  sendGAEvent("estimate_view", {
    estimate_amount: estimateAmount,
  });
};
