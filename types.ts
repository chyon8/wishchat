interface SurveyState {
  stage: "initial" | "questioning" | "summary";
  currentQuestion: QuestionResponse | null;
  answers: Answer[];
  summary: SummaryResponse | null;
  isLoading: boolean;
  progress: number;
  error: string | null;
}

interface QuestionResponse {
  text: string;
  type: "text" | "multiple-choice";
  options: string[];
}

interface Answer {
  question: string;
  answer: string;
}

interface SummaryResponse {
  overview: string;
  requirements: string[];
  environment: string;
  features: Array<{
    name: string;
    description: string;
  }>;
}
