interface SurveyState {
  stage: "initial" | "questioning" | "summary";
  currentQuestion: QuestionResponse | null;
  answers: Answer[];
  summary: SummaryResponse | null;
  isLoading: boolean;
  progress: number;
  error: string | null;
  currentIndex: number;
}

interface QuestionResponse {
  text: string;
  type: "text" | "multiple-choice";
  options: string[];
}

interface Answer {
  question: string;
  answer: string | string[];
  type: "text" | "multiple-choice";
  questionData: QuestionResponse; // 질문 데이터 전체를 저장
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
