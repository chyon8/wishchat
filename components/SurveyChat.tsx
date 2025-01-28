"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import EstimationDisplay from "./estimationDisplay";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import ComplexityDisplay from "./ComplexityDisplay";
import EditableTextArea from "./EditableTextArea";
import useItemRemoval from "../hooks/useItemRemoval";
import WorkRangeSelection from "./WorkRangeSelection";

export default function SurveyChat() {
  const [state, setState] = useState<SurveyState>({
    stage: "initial",
    currentQuestion: {
      text: "진행하실 프로젝트 내용을 설명해주세요",
      type: "text",
      options: [],
    },
    answers: [],
    summary: null,
    isLoading: false,
    progress: 0,
    error: null,
    currentIndex: 0,
    isRegistered: false,
    estimation: null,
    complexity: null,
  });

  const { toast } = useToast();

  const [input, setInput] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showTextInput, setShowTextInput] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const AI_QUESTIONS = 5;
  const HUMAN_QUESTIONS = 2;
  const totalAIQuestions = AI_QUESTIONS; // AI 질문 개수
  const totalHumanQuestions = HUMAN_QUESTIONS; // HUMAN 질문 개수
  const totalQuestions = totalAIQuestions + totalHumanQuestions; // 총 질문 개수
  const isLastQuestion = state.answers.length === totalQuestions - 1;

  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    email: "",
    phone: "",
    projectData: {
      overview: "",
      requirements: [],
      environment: "",
      features: [],
      workRange: [],
      additional: "",
    },
  });

  const { handleRemove, handleAdd } = useItemRemoval(
    registrationData,
    setRegistrationData
  );

  useEffect(() => {
    if (state.summary) {
      setRegistrationData((prev) => ({
        ...prev,
        projectData: {
          answer: state.answers,
          overview: state.summary?.overview || "",
          requirements: state.summary?.requirements || [],
          environment: state.summary?.environment || "",
          features: state.summary?.features || [],
          workRange: state.summary?.workRange || [],
          additional: state.summary?.additional || "",
        },
      }));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.summary]);

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
    const storedData = localStorage.getItem("surveyState");
    if (storedData) {
      const parsedData = JSON.parse(storedData);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { answer, ...projectDataWithoutAnswer } =
        registrationData.projectData;

      const updatedData = {
        ...parsedData,
        summary: projectDataWithoutAnswer,
      };

      localStorage.setItem("surveyState", JSON.stringify(updatedData));
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { answer, ...projectDataWithoutAnswer } =
        registrationData.projectData;

      const newData = {
        summary: projectDataWithoutAnswer,
      };

      localStorage.setItem("surveyState", JSON.stringify(newData));
    }
  }, [registrationData]);

  useEffect(() => {
    localStorage.setItem("surveyState", JSON.stringify(state));
  }, [state]);

  const handleReset = () => {
    localStorage.removeItem("surveyState");
    setState({
      stage: "initial",
      currentQuestion: {
        text: "진행하실 프로젝트 내용을 설명해주세요",
        type: "text",
        options: [],
      },
      answers: [],
      summary: null,
      isLoading: false,
      progress: 0,
      error: null,
      currentIndex: 0,
      isRegistered: false,
      estimation: null,
      complexity: null,
    });
    setInput("");
    setSelectedOptions([]);
    setShowTextInput(false);
  };

  //견적 계산
  const handleEstimate = async () => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
    }));
    // 필요한 데이터만 추출

    const requestData = {
      overview: registrationData.projectData.overview,
      requirements: registrationData.projectData.requirements,
      environment: registrationData.projectData.environment,
      features: registrationData.projectData.features,
    };

    try {
      const response = await fetch("/api/chat/estimation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestData }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setState((prev) => ({
        ...prev,
        estimation: data.estimation,
        complexity: data.complexity,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleNext = async (directInput?: string) => {
    if (state.isLoading) return;

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const directTextInput = directInput || input;

      const currentAnswer = {
        question: state.currentQuestion?.text || "",
        directTextInput,
        selectedOptions,
        type: state.currentQuestion?.type || "text",
        questionData: state.currentQuestion!, // 현재 질문 데이터 저장
      };

      const newAnswers = [...state.answers];
      newAnswers[state.currentIndex] = currentAnswer;

      const humanQuestions: QuestionResponse[] = [
        {
          text: "필요하신 업무 범위를 말해주세요",
          type: "multiple-choice",
          options: ["기획", "디자인", "개발", "모르겠어요"],
          /*
          description: {
            기획: "필요한 기능과 화면 흐름을 정리해 프로젝트의 기본 틀을 만드는 과정",
            디자인: "사용자 경험을 고려해 화면과 동작을 설계하는 과정",
            개발: "설계된 기능과 화면을 실제로 구현하는 과정",
          }, */
        },
        {
          text: "추가적인 정보가 있다면 알려주세요",
          type: "text",
          options: [],
        },
      ];

      if (newAnswers.length >= totalQuestions) {
        // 서머리로 상태 변경 먼저
        setState((prev) => ({
          ...prev,
          stage: "summary",
          isLoading: true,
          progress: 100,
        }));

        const response = await fetch("/api/chat/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: newAnswers }),
        });

        if (!response.ok) throw new Error("Failed to get summary");

        const data = await response.json();

        setState((prev) => ({
          ...prev,
          summary: data.summary,
          answers: newAnswers,
          isLoading: false,
        }));

        setRegistrationData((prev) => ({
          ...prev,
          projectData: {
            overview: data.summary.overview || "",
            requirements: data.summary.requirements || [],
            environment: data.summary.environment || "",
            features: data.summary.features || [],
            workRange: data.summary.workRange || [],
            additional: data.summary.additional || "",
          },
        }));
      } else {
        // AI 질문 개수만큼 질문을 완료한 후 HUMAN 질문 진행
        if (newAnswers.length < totalAIQuestions) {
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
            progress: Math.min((nextIndex / totalQuestions) * 100, 100),
          }));

          setSelectedOptions([]);
          setInput("");
          setShowTextInput(false);
        } else {
          // HUMAN 질문 렌더링
          const nextIndex = state.currentIndex + 1;

          setState((prev) => ({
            ...prev,
            stage: "questioning",
            currentQuestion: humanQuestions[nextIndex - totalAIQuestions], // HUMAN 질문은 지정된 질문 목록에서 가져옴
            answers: newAnswers,
            isLoading: false,
            currentIndex: nextIndex,
            progress: Math.min((nextIndex / totalQuestions) * 100, 100),
          }));

          setSelectedOptions([]);
          setInput("");
          setShowTextInput(false);
        }
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
    if (state.currentIndex > 1) {
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
          Array.isArray(previousAnswer.selectedOptions)
            ? previousAnswer.selectedOptions
            : []
        );
        setShowTextInput(previousAnswer.directTextInput !== "");
        setInput(previousAnswer.directTextInput);
      } else {
        setInput(
          typeof previousAnswer.directTextInput === "string"
            ? previousAnswer.directTextInput
            : ""
        );
        setShowTextInput(true);
      }
    }
  };

  const hasDescription =
    state.currentQuestion && "description" in state.currentQuestion;

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
            {hasDescription && state.currentQuestion?.description?.[option]
              ? `${option}: ${state.currentQuestion?.description?.[option]}`
              : option}
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

      {showTextInput && (
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            state.answers.length < totalQuestions - 1
              ? "답변을 입력하세요..."
              : "추가로 알려주실 구체적인 사항이 있다면 알려주세요. 예)참고사이트, 개발 환경, 기존 웹과 연동 필요 등 " // 마지막 질문
          }
          disabled={state.isLoading}
        />
      )}
    </div>
  );

  const renderTextInput = () => (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            state.answers.length < totalQuestions - 1
              ? "답변을 입력하세요..."
              : "추가로 알려주실 구체적인 사항이 있다면 알려주세요. 예) 참고 사이트, 개발 환경, 기존 웹과 연동 필요 등 " // 마지막 질문
          }
          disabled={state.isLoading}
        />
        {/*
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
          */}
      </div>
    </div>
  );

  const renderSummary = () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks

    const validateForm = () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[0-9]{2,3}[0-9]{3,4}[0-9]{4}$/;

      if (!emailRegex.test(registrationData.email)) {
        toast({
          variant: "destructive",
          title: "이메일 형식이 올바르지 않습니다",
          description: "올바른 이메일 주소를 입력해주세요.",
        });
        return false;
      }

      if (!phoneRegex.test(registrationData.phone)) {
        toast({
          variant: "destructive",
          title: "전화번호 형식이 올바르지 않습니다",
          description: "01012345678 형식으로 입력해주세요.",
        });
        return false;
      }

      return true;
    };

    const handleRegister = async () => {
      if (!validateForm()) return;

      setIsRegistering(true);
      try {
        const response = await fetch("/api/register-project", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ registrationData }),
        });

        if (!response.ok) throw new Error("등록 실패");

        toast({
          title: "프로젝트가 등록되었습니다",
          description: "24시간안에 연락드리겠습니다.",
        });

        setIsModalOpen(false);

        setState((prev) => ({
          ...prev,
          isRegistered: true,
        }));
        // handleReset();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast({
          variant: "destructive",
          title: "등록 실패",
          description:
            "프로젝트 등록 중 오류가 발생했습니다. 다시 시도해주세요.",
        });
      } finally {
        setIsRegistering(false);
      }
    };

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">프로젝트 요약</h2>

        <div className="flex space-x-4">
          <button
            className={`p-2 ${
              activeTab === "preview" ? "border-b-2 border-blue-500" : ""
            }`}
            onClick={() => setActiveTab("preview")}
          >
            미리보기
          </button>
          <button
            className={`p-2 ${
              activeTab === "edit" ? "border-b-2 border-blue-500" : ""
            }`}
            onClick={() => setActiveTab("edit")}
          >
            수정
          </button>
        </div>
        {/* code for summary */}
        {activeTab === "preview" ? (
          <>
            <div>
              <h3 className="font-semibold">프로젝트 개요</h3>
              <p>{registrationData.projectData.overview}</p>
            </div>
            <div>
              <h3 className="font-semibold">필요 요소</h3>
              <ul className="list-disc pl-5">
                {registrationData.projectData.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">개발 환경/언어</h3>
              <p>{registrationData.projectData.environment}</p>
            </div>
            <div>
              <h3 className="font-semibold">주요 기능</h3>
              <ul className="list-disc pl-5">
                {registrationData.projectData.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">업무 범위</h3>
              <ul className="list-disc pl-5">
                {registrationData.projectData.workRange.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">추가 정보</h3>
              <p>{registrationData.projectData.additional}</p>
            </div>
          </>
        ) : (
          <>
            {" "}
            <div>
              <h3 className="font-semibold mb-2">프로젝트 개요</h3>
              <Textarea
                value={registrationData.projectData.overview}
                onChange={(e) =>
                  setRegistrationData((prev) => ({
                    ...prev,
                    projectData: {
                      ...prev.projectData,
                      overview: e.target.value,
                    },
                  }))
                }
                className="min-h-[100px]"
              />
            </div>
            <div>
              <h3 className="font-semibold mb-2">필요 요소</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAdd("requirements")}
              >
                <Plus className="h-4 w-4" />
                추가
              </Button>
              {registrationData.projectData.requirements.map((req, i) => (
                <EditableTextArea
                  key={i}
                  value={req}
                  onRemove={() => handleRemove("requirements", i)}
                  onChange={(e) => {
                    const newReqs = [
                      ...registrationData.projectData.requirements,
                    ];
                    newReqs[i] = e.target.value;
                    setRegistrationData((prev) => ({
                      ...prev,
                      projectData: {
                        ...prev.projectData,
                        requirements: newReqs,
                      },
                    }));
                  }}
                  className="mb-2"
                />
              ))}
            </div>
            <div>
              <h3 className="font-semibold mb-2">개발 환경/언어</h3>
              <Textarea
                value={registrationData.projectData.environment}
                onChange={(e) =>
                  setRegistrationData((prev) => ({
                    ...prev,
                    projectData: {
                      ...prev.projectData,
                      environment: e.target.value,
                    },
                  }))
                }
              />
            </div>
            <div>
              <h3 className="font-semibold mb-2">주요 기능</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAdd("features")}
              >
                <Plus className="h-4 w-4 " />
                추가
              </Button>
              {registrationData.projectData.features.map((feature, i) => (
                <EditableTextArea
                  key={i}
                  value={feature}
                  onRemove={() => handleRemove("features", i)}
                  onChange={(e) => {
                    const newFeatures = [
                      ...registrationData.projectData.features,
                    ];
                    newFeatures[i] = e.target.value;
                    setRegistrationData((prev) => ({
                      ...prev,
                      projectData: {
                        ...prev.projectData,
                        features: newFeatures,
                      },
                    }));
                  }}
                  className="mb-2"
                />
              ))}
            </div>
            <div>
              {/* 업무 범위
              <h3 className="font-semibold mb-2">업무 범위</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAdd("workRange")}
              >
                <Plus className="h-4 w-4" />
                추가
              </Button>
              {registrationData.projectData.workRange.map((workRange, i) => (
                <EditableTextArea
                  key={i}
                  value={workRange}
                  onRemove={() => handleRemove("workRange", i)}
                  onChange={(e) => {
                    const workRange = [
                      ...registrationData.projectData.workRange,
                    ];
                    workRange[i] = e.target.value;
                    setRegistrationData((prev) => ({
                      ...prev,
                      projectData: {
                        ...prev.projectData,
                        workRange: workRange,
                      },
                    }));
                  }}
                  className="mb-2"
                />
              ))}
                */}
              <WorkRangeSelection
                selected={registrationData.projectData.workRange}
                onChange={(newWorkRange) => {
                  setRegistrationData((prev) => ({
                    ...prev,
                    projectData: {
                      ...prev.projectData,
                      workRange: newWorkRange,
                    },
                  }));
                }}
              />
            </div>
            <div>
              <h3 className="font-semibold mb-2">추가 정보</h3>
              <Textarea
                value={registrationData.projectData.additional}
                onChange={(e) =>
                  setRegistrationData((prev) => ({
                    ...prev,
                    projectData: {
                      ...prev.projectData,
                      additional: e.target.value,
                    },
                  }))
                }
                className="min-h-[100px]"
              />
            </div>
          </>
        )}

        {/* code for summary */}

        <div className="flex gap-2 mt-6">
          <Button
            disabled={state.isRegistered}
            variant="default"
            className="flex-1"
            onClick={() => setIsModalOpen(true)}
          >
            {state.isRegistered ? (
              <span>등록 완료</span>
            ) : (
              <span>프로젝트 등록하기</span>
            )}
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleReset}>
            새로운 상담 시작
          </Button>
        </div>

        <Button
          className="flex-1"
          onClick={handleEstimate}
          disabled={state.isLoading}
        >
          {state.isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>계산 중...</span>
            </div>
          ) : (
            "견적 계산하기"
          )}
        </Button>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>프로젝트 등록</DialogTitle>
              <DialogDescription>
                프로젝트 등록을 위해 연락처 정보를 입력해주세요.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  이메일
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={registrationData.email}
                  onChange={(e) =>
                    setRegistrationData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  전화번호
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="01012345678"
                  value={registrationData.phone}
                  onChange={(e) =>
                    setRegistrationData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isRegistering}
              >
                취소
              </Button>
              <Button onClick={handleRegister} disabled={isRegistering}>
                {isRegistering ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    등록 중...
                  </>
                ) : (
                  "등록하기"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  const renderContent = () => {
    if (state.error) {
      return (
        <>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
          <Button onClick={handleReset}>새로운 상담 시작</Button>
        </>
      );
    }

    //로딩
    if (state.stage === "summary" && !state.summary) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-3 text-gray-500">
            프로젝트 내용을 요약하고있습니다...
          </span>
        </div>
      );
    }

    if (state.stage === "summary" && state.summary) {
      return renderSummary();
    }

    return (
      <div className="space-y-4">
        <p className="font-medium">{state.currentQuestion?.text}</p>

        {/*
        {state.currentQuestion?.type === "multiple-choice" && !showTextInput
          ? renderMultipleChoice()
          : renderTextInput()}
*/}

        {state.currentQuestion?.type === "multiple-choice"
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
            onClick={() => handleNext()}
            disabled={
              !isLastQuestion &&
              (state.isLoading || // 로딩 중이면 비활성화
                //  !(input.trim() || selectedOptions.length > 0))
                !(
                  (typeof input === "string" && input.trim()) ||
                  selectedOptions.length > 0
                ))
            }
          >
            {state.isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : state.answers.length >= totalQuestions - 1 ? (
              "완료"
            ) : (
              "다음"
            )}
          </Button>
        </div>
        {(state.stage !== "initial" || state.error) && (
          <Button onClick={handleReset}>새로운 상담 시작</Button>
        )}
      </div>
    );
  };

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <Progress value={state.progress} className="mb-6" />
          {renderContent()}
        </CardContent>
      </Card>

      {state.stage !== "initial" && state.complexity !== null && (
        <ComplexityDisplay complexity={state.complexity} />
      )}

      {state.stage !== "initial" && state.estimation !== null && (
        <EstimationDisplay
          estimation={state.estimation}
          workRange={registrationData.projectData.workRange}
        />
      )}

      {state.stage !== "initial" && (
        <Card className="w-full max-w-2xl mx-auto mt-8">
          <CardContent className="pt-6">
            {/* 원래 답변 */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold">질문 및 답변 원본</h2>
              <ul className="list-none pl-5">
                {state.answers.map((item, index) => (
                  <li className="mb-3" key={index}>
                    <p>
                      <strong>질문 :</strong> {item.question}
                    </p>
                    {item.directTextInput && (
                      <p className="text-slate-600">
                        <span>직접입력:</span> {item.directTextInput}
                      </p>
                    )}

                    {item.selectedOptions.length > 0 && (
                      <p className="text-slate-600">
                        <span>선택입력:</span>{" "}
                        {Array.isArray(item.selectedOptions)
                          ? item.selectedOptions.join(", ")
                          : item.selectedOptions}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {state.stage == "initial" && (
        <div className="w-full max-w-2xl mx-auto mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              const text = e.currentTarget.textContent || "";
              setInput(text);
              handleNext(text);
            }}
          >
            AI 챗봇을 만들고 싶어요
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              const text = e.currentTarget.textContent || "";
              setInput(text);
              handleNext(text);
            }}
          >
            쇼핑몰을 만들고싶어요
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              const text = e.currentTarget.textContent || "";
              setInput(text);
              handleNext(text);
            }}
          >
            업무 자동화를 하고싶어요
          </Button>
        </div>
      )}
    </>
  );
}
