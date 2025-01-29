/* eslint-disable @typescript-eslint/no-unused-vars */

interface ManMonth {
  frontend: number;
  backend: number;
  designer: number;
  planner: number;
  pm: number;
  reason: string;
}

interface SurveyState {
  stage: "initial" | "questioning" | "summary";
  currentQuestion: QuestionResponse | null;
  answers: Answer[];
  summary: SummaryResponse | null;
  isLoading: boolean;
  progress: number;
  error: string | null;
  currentIndex: number;
  isRegistered: boolean;
  estimation: ManMonth | null;
  complexity: ComplexityResponse | null;
  numberOfQuestions: number;
}

interface QuestionResponse {
  text: string;
  type: "text" | "multiple-choice";
  options: string[];
  description?: Record<string, string>;
}

interface Answer {
  question: string;
  //answer: string | string[];
  directTextInput: string;
  selectedOptions: string[];
  type: "text" | "multiple-choice";
  questionData: QuestionResponse; // 질문 데이터 전체를 저장
}

interface SummaryResponse {
  overview: string;
  requirements: string[];
  environment: string;
  features: string[];
  workRange: string[];
  additional: string;
}

interface EstimationResponse {
  frontend: number;
  backend: number;
  designer: number;
  planner: number;
  pm: number;
  reason: string;
}

interface FirstQuestion {
  text: string;
  type: "text" | "multiple-choice";
  options: string[];
  description?: Record<string, string>;
  numOfQuestions?: number;
}

interface RegistrationData {
  email: string;
  phone: string;
  projectData: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    answer?: any;
    overview: string;
    requirements: string[];
    environment: string;
    // features: Array<{ name: string; description: string }>;
    features: string[];
    workRange: string[];
    additional: string;
  };
}

interface ComplexityResponse {
  complexity: string;
  reasonComplexity: string;
}
