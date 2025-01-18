"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function SurveyChat() {
  //test
  const testSummary = {
    overview: "test",
    requirements: ["test"],
    environment: "test",
    features: [{ name: "test", description: "test" }],
  };

  const [state, setState] = useState<SurveyState>({
    //stage: "initial",
    stage: "summary",
    currentQuestion: {
      text: "어떤 서비스를 만들고 싶으세요?",
      type: "text",
      options: [],
    },
    answers: [],
    //summary: null,
    summary: testSummary,
    isLoading: false,
    progress: 0,
    error: null,
    currentIndex: 0,
  });

  const [input, setInput] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showTextInput, setShowTextInput] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const TOTAL_QUESTIONS = 5;

  useEffect(() => {
    const savedState = localStorage.getItem("surveyState");
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      setState(parsedState);
      // 현재 답변이 있다면 선택된 옵션 복원
      if (parsedState.answers[parsedState.currentIndex]) {
        const currentAnswer =
          parsedState.answers[parsedState.currentIndex].answer;
        if (typeof currentAnswer === "string") {
          setInput(currentAnswer);
        } else {
          setSelectedOptions(currentAnswer || []);
        }
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("surveyState", JSON.stringify(state));
  }, [state]);

  const handleRegister = async () => {
    if (isRegistering || isRegistered) return;

    setIsRegistering(true);
    try {
      const projectData = {
        overview: state.summary?.overview,
        requirements: state.summary?.requirements,
        environment: state.summary?.environment,
        features: state.summary?.features,
        answers: state.answers,
      };

      const response = await fetch("/api/register-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) throw new Error("등록 실패");

      setIsRegistered(true);
    } catch (error) {
      console.error("등록 오류:", error);
      setState((prev) => ({
        ...prev,
        stage: "summary",
        //error: "프로젝트 등록 중 오류가 발생했습니다.",
      }));
    } finally {
      setIsRegistering(false);
    }
  };

  const handleNext = async () => {
    if (state.isLoading) return;

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      let answer: string | string[];
      if (showTextInput || state.currentQuestion?.type === "text") {
        answer = input;
      } else {
        answer = selectedOptions;
      }

      const newAnswers = [...state.answers];
      const currentAnswer = {
        question: state.currentQuestion?.text || "",
        answer,
        type: state.currentQuestion?.type || "text",
        questionData: state.currentQuestion!, // 현재 질문 데이터 저장
      };

      if (newAnswers[state.currentIndex]) {
        newAnswers[state.currentIndex] = currentAnswer;
      } else {
        newAnswers.push(currentAnswer);
      }

      if (newAnswers.length >= TOTAL_QUESTIONS) {
        const response = await fetch("/api/chat/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: newAnswers }),
        });

        if (!response.ok) throw new Error("Failed to get summary");

        const data = await response.json();

        setState((prev) => ({
          ...prev,
          stage: "summary",
          summary: data.summary,
          answers: newAnswers,
          isLoading: false,
          progress: 100,
        }));
      } else {
        const response = await fetch("/api/chat/question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: newAnswers }),
        });

        if (!response.ok) throw new Error("Failed to get question");

        const data = await response.json();
        const nextIndex = state.currentIndex + 1;

        setState((prev) => ({
          ...prev,
          stage: "questioning",
          currentQuestion: data.question,
          answers: newAnswers,
          isLoading: false,
          currentIndex: nextIndex,
          progress: Math.min((nextIndex / TOTAL_QUESTIONS) * 100, 100),
        }));

        setSelectedOptions([]);
        setInput("");
        setShowTextInput(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "오류가 발생했습니다. 다시 시도해주세요.",
      }));
    }
  };

  const handlePrevious = () => {
    if (state.currentIndex > 0) {
      const previousIndex = state.currentIndex - 1;
      const previousAnswer = state.answers[previousIndex];

      setState((prev) => ({
        ...prev,
        currentIndex: previousIndex,
        stage: "questioning",
        currentQuestion: previousAnswer.questionData, // 저장된 질문 데이터 복원
        progress: Math.max((previousIndex / 7) * 100, 0),
      }));

      // 이전 답변 상태 복원
      if (previousAnswer.type === "multiple-choice") {
        setSelectedOptions(
          Array.isArray(previousAnswer.answer) ? previousAnswer.answer : []
        );
        setShowTextInput(false);
      } else {
        setInput(
          typeof previousAnswer.answer === "string" ? previousAnswer.answer : ""
        );
        setShowTextInput(true);
      }
    }
  };

  const handleReset = () => {
    localStorage.removeItem("surveyState");
    setState({
      stage: "initial",
      currentQuestion: {
        text: "어떤 서비스를 만들고 싶으세요?",
        type: "text",
        options: [],
      },
      answers: [],
      summary: null,
      isLoading: false,
      progress: 0,
      error: null,
      currentIndex: 0,
    });
    setInput("");
    setSelectedOptions([]);
    setShowTextInput(false);
  };

  const renderMultipleChoice = () => (
    <div className="space-y-2">
      {state.currentQuestion?.options.map((option, i) => (
        <div key={i} className="flex items-center space-x-2">
          <Checkbox
            id={`option-${i}`}
            checked={selectedOptions.includes(option)}
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedOptions((prev) => [...prev, option]);
              } else {
                setSelectedOptions((prev) =>
                  prev.filter((item) => item !== option)
                );
              }
            }}
          />
          <label
            htmlFor={`option-${i}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {option}
          </label>
        </div>
      ))}
      <Button
        variant="outline"
        className="w-full mt-2"
        onClick={() => setShowTextInput(true)}
      >
        직접 입력하기
      </Button>
    </div>
  );

  const renderTextInput = () => (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="답변을 입력하세요..."
          disabled={state.isLoading}
        />
        {state.currentQuestion?.type === "multiple-choice" && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setShowTextInput(false);
              setInput("");
            }}
          >
            선택지로 돌아가기
          </Button>
        )}
      </div>
    </div>
  );

  const renderSummary = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">프로젝트 요약</h2>
      <div>
        <h3 className="font-semibold">프로젝트 개요</h3>
        <p>{state.summary?.overview}</p>
      </div>
      <div>
        <h3 className="font-semibold">필요 요소</h3>
        <ul className="list-disc pl-5">
          {state.summary?.requirements.map((req, i) => (
            <li key={i}>{req}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold">개발 환경/언어</h3>
        <p>{state.summary?.environment}</p>
      </div>
      <div>
        <h3 className="font-semibold">주요 기능</h3>
        <ul className="list-disc pl-5">
          {state.summary?.features.map((feature, i) => (
            <li key={i}>
              <strong>{feature.name}:</strong> {feature.description}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex gap-2 mt-6">
        <Button
          variant="default"
          className="flex-1"
          onClick={handleRegister}
          disabled={isRegistering || isRegistered}
        >
          {isRegistering ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : isRegistered ? (
            "등록 완료!"
          ) : (
            "프로젝트 등록하기"
          )}
        </Button>
        <Button onClick={handleReset}>새로운 상담 시작</Button>
      </div>
    </div>
  );

  const renderContent = () => {
    if (state.error) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      );
    }

    if (state.stage === "summary" && state.summary) {
      return renderSummary();
    }

    return (
      <div className="space-y-4">
        <p className="font-medium">{state.currentQuestion?.text}</p>
        {state.currentQuestion?.type === "multiple-choice" && !showTextInput
          ? renderMultipleChoice()
          : renderTextInput()}

        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={state.currentIndex === 0 || state.isLoading}
          >
            이전
          </Button>
          <Button
            onClick={handleNext}
            disabled={
              state.isLoading ||
              (!showTextInput &&
                state.currentQuestion?.type === "multiple-choice" &&
                selectedOptions.length === 0) ||
              ((showTextInput || state.currentQuestion?.type === "text") &&
                !input.trim())
            }
          >
            {state.isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : state.answers.length >= 6 ? (
              "완료"
            ) : (
              "다음"
            )}
          </Button>
        </div>
        {state.stage !== "initial" && (
          <Button onClick={handleReset}>새로운 상담 시작</Button>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="pt-6">
        <Progress value={state.progress} className="mb-6" />
        {renderContent()}
      </CardContent>
    </Card>
  );
}
