"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

export default function SurveyChat() {
  const [state, setState] = useState<SurveyState>({
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
  });
  const [input, setInput] = useState("");

  useEffect(() => {
    // Load saved state from localStorage
    const savedState = localStorage.getItem("surveyState");
    if (savedState) {
      setState(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    // Save state to localStorage
    localStorage.setItem("surveyState", JSON.stringify(state));
  }, [state]);

  const handleAnswer = async (answer: string) => {
    if (state.isLoading) return;

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      if (state.answers.length >= 6) {
        const response = await fetch("/api/chat/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: [
              ...state.answers,
              {
                question: state.currentQuestion?.text || "",
                answer,
              },
            ],
          }),
        });

        if (!response.ok) throw new Error("Failed to get summary");

        const data = await response.json();

        setState((prev) => ({
          ...prev,
          stage: "summary",
          summary: data.summary,
          isLoading: false,
          progress: 100,
        }));
      } else {
        const response = await fetch("/api/chat/question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: [
              ...state.answers,
              {
                question: state.currentQuestion?.text || "",
                answer,
              },
            ],
          }),
        });

        if (!response.ok) throw new Error("Failed to get question");

        const data = await response.json();

        setState((prev) => ({
          ...prev,
          currentQuestion: data.question,
          answers: [
            ...prev.answers,
            {
              question: prev.currentQuestion?.text || "",
              answer,
            },
          ],
          isLoading: false,
          progress: Math.min(((prev.answers.length + 1) / 7) * 100, 100),
        }));
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
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">프로젝트 요약</h2>
          <div>
            <h3 className="font-semibold">프로젝트 개요</h3>
            <p>{state.summary.overview}</p>
          </div>
          <div>
            <h3 className="font-semibold">필요 요소</h3>
            <ul className="list-disc pl-5">
              {state.summary.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">개발 환경/언어</h3>
            <p>{state.summary.environment}</p>
          </div>
          <div>
            <h3 className="font-semibold">주요 기능</h3>
            <ul className="list-disc pl-5">
              {state.summary.features.map((feature, i) => (
                <li key={i}>
                  <strong>{feature.name}:</strong> {feature.description}
                </li>
              ))}
            </ul>
          </div>
          <Button
            onClick={() => {
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
              });
            }}
          >
            새로운 상담 시작
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <p className="font-medium">{state.currentQuestion?.text}</p>
        {state.currentQuestion?.type === "multiple-choice" ? (
          <div className="space-y-2">
            {state.currentQuestion.options.map((option, i) => (
              <Button
                key={i}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleAnswer(option)}
                disabled={state.isLoading}
              >
                {option}
              </Button>
            ))}
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) {
                handleAnswer(input);
                setInput("");
              }
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="답변을 입력하세요..."
              disabled={state.isLoading}
            />
            <Button type="submit" disabled={state.isLoading || !input.trim()}>
              {state.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "제출"
              )}
            </Button>
          </form>
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
