/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import AutoResizeTextarea from "@/components/AutoResizeTextarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import { INSPECTION_SUMMARY_SYSTEM_PROMPT } from "@/lib/prompts";

// 응답 데이터를 위한 타입 정의
type ResponseItem = {
  type?: string;
  text?: string;
  [key: string]: any;
};

type ApiResponse = {
  summary?: string | ResponseItem | ResponseItem[] | any;
  [key: string]: any;
};

export default function Playground() {
  const [memo, setMemo] = useState<string>("");
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [editedSummary, setEditedSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPromptLoading, setIsPromptLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("preview");
  const [selectedModel, setSelectedModel] = useState("GPT 4o");

  // 로컬 스토리지에서 데이터 불러오기
  useEffect(() => {
    const savedMemo = localStorage.getItem("memo");
    const savedSummary = localStorage.getItem("summary");
    const savedPrompt = localStorage.getItem("userPrompt");

    if (savedMemo) setMemo(savedMemo);
    if (savedPrompt) setUserPrompt(savedPrompt);
    if (savedSummary) {
      setSummary(savedSummary);
      // 에디터에 표시할 때도 줄바꿈 처리
      setEditedSummary(savedSummary.replace(/\\n/g, "\n"));
    }
  }, []);

  // 메모, 프롬프트, 요약을 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem("memoPG", memo);
  }, [memo]);

  useEffect(() => {
    localStorage.setItem("userPrompt", userPrompt);
  }, [userPrompt]);

  useEffect(() => {
    localStorage.setItem("summaryPG", summary);
  }, [summary]);

  // 수정된 요약이 변경될 때마다 바로 저장
  useEffect(() => {
    if (activeTab === "edit") {
      // 저장할 때는 다시 \\n 형태로 변환
      setSummary(editedSummary.replace(/\n/g, "\\n"));
    }
  }, [editedSummary, activeTab]);

  // 다양한 형식의 응답에서 텍스트만 추출하는 함수
  const extractTextFromResponse = (response: any): string => {
    // 응답이 없는 경우
    if (!response) return "";

    try {
      // 응답 자체가 문자열인 경우
      if (typeof response === "string") {
        // JSON 문자열인지 확인하고 파싱 시도
        try {
          const parsedJson = JSON.parse(response);
          // 파싱된 JSON이 객체나 배열인 경우 재귀적으로 처리
          return extractTextFromResponse(parsedJson);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          // 파싱 실패하면 그냥 문자열로 반환
          return response;
        }
      }

      // 응답이 배열인 경우
      if (Array.isArray(response)) {
        // text 필드가 있는 객체 형태인지 확인
        if (
          response.length > 0 &&
          response[0] &&
          typeof response[0].text === "string"
        ) {
          return response
            .filter((item) => item && typeof item.text === "string")
            .map((item) => item.text as string)
            .join("\n");
        }
        // 일반 배열인 경우 모든 요소를 문자열로 변환하여 연결
        return response.map((item) => String(item)).join("\n");
      }

      // 응답이 객체인 경우
      if (response && typeof response === "object") {
        // summary 필드가 있는 경우
        if (response.summary !== undefined) {
          return extractTextFromResponse(response.summary);
        }
        // text 필드가 있는 경우
        if (typeof response.text === "string") {
          return response.text;
        }
        // 다른 필드들만 있는 경우 - 첫 번째 문자열 필드를 사용하거나 전체를 문자열로 변환
        const firstStringProp = Object.values(response).find(
          (val) => typeof val === "string"
        ) as string | undefined;

        if (firstStringProp) {
          return firstStringProp;
        }
        return JSON.stringify(response)
          .replace(/^"|"$/g, "")
          .replace(/\\"/g, '"');
      }

      // 기타 타입인 경우 문자열로 변환
      return String(response);
    } catch (error) {
      console.error("텍스트 추출 오류:", error);
      return "";
    }
  };

  const handleSummary = async () => {
    if (!memo.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/inspection/playground", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: [{ text: memo }],
          userPrompt: userPrompt,
          model: selectedModel, // 선택된 모델 전달
        }),
      });

      if (!response.ok) throw new Error("요약 요청 실패");

      let data: ApiResponse;
      const contentType = response.headers.get("content-type");

      // 응답 형식에 따라 다르게 처리
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        // JSON이 아닌 경우 텍스트로 처리
        const textData = await response.text();
        data = { summary: textData };
      }

      // 추출 함수를 사용하여 텍스트만 가져옴
      const newSummary = extractTextFromResponse(data);
      setSummary(newSummary);

      // 에디터에 표시할 때는 줄바꿈 처리
      setEditedSummary(newSummary.replace(/\\n/g, "\n"));
    } catch (error) {
      console.error("요약 오류:", error);
      setSummary("");
      setEditedSummary("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPrompt = () => {
    setUserPrompt(INSPECTION_SUMMARY_SYSTEM_PROMPT);
  };

  const handleRandomPrompt = async () => {
    setIsPromptLoading(true);
    try {
      const response = await fetch("/api/inspection/randomPrompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("요청 실패");

      let data: ApiResponse;
      const contentType = response.headers.get("content-type");

      // 응답 형식에 따라 다르게 처리
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        // JSON이 아닌 경우 텍스트로 처리
        const textData = await response.text();
        data = { result: textData };
      }

      // 추출 함수를 사용하여 텍스트만 가져옴
      const newResult = extractTextFromResponse(data);
      setUserPrompt(newResult);
    } catch (error) {
      console.error("생성 오류:", error);
      setUserPrompt("");
    } finally {
      setIsPromptLoading(false);
    }
  };

  const handleNewMemo = () => {
    setMemo("");
    setSummary("");
    setEditedSummary("");
    // 프롬프트는 유지할지 여부를 결정
    // setUserPrompt("");
    localStorage.removeItem("memo");
    localStorage.removeItem("summary");
    // localStorage.removeItem("userPrompt");
  };

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold text-slate-400">프롬프트</h2>
          <Button
            onClick={handleSetPrompt}
            className="text-xs px-2 py-1 h-5 min-w-[60px]"
          >
            예시
          </Button>
          <Button
            onClick={handleRandomPrompt}
            className="bg-slate-600 text-xs px-2 py-1 h-5 min-w-[60px]"
          >
            {isPromptLoading ? (
              <>
                <Loader2 className="text-xs h-4 w-4 animate-spin" />
                생성 중...
              </>
            ) : (
              "랜덤 생성"
            )}
          </Button>
        </div>
        <AutoResizeTextarea
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="시스템 프롬프트를 입력하세요..."
          className="min-h-[80px] w-full p-2 border-4 rounded"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          응답 모델 선택
        </label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="GPT 4o">GPT 4o</option>
          <option value="GPT 4o mini">GPT 4o mini</option>
          <option value="Claude 3.5">Claude 3.5</option>
          <option value="Claude 3.7">Claude 3.7</option>
        </select>
      </div>

      <hr />

      <div className="space-y-2">
        <h2 className="text-xl font-bold">입력</h2>
        <AutoResizeTextarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="내용을 입력하세요..."
          className="min-h-[100px] w-full p-2 border rounded"
        />
        <div className="flex space-x-2">
          <Button onClick={handleSummary} disabled={isLoading || !memo.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                생성 중...
              </>
            ) : (
              "생성"
            )}
          </Button>
          <Button variant="outline" onClick={handleNewMemo}>
            새로고침
          </Button>
        </div>
      </div>

      {summary && (
        <div className="space-y-2">
          <h2 className="text-xl font-bold">결과</h2>
          <div className="flex justify-between items-center">
            <Tabs
              defaultValue="preview"
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-grow"
            >
              <TabsList className="grid grid-cols-2 w-64">
                <TabsTrigger value="preview">미리보기</TabsTrigger>
                <TabsTrigger value="edit">수정모드</TabsTrigger>
              </TabsList>
              <TabsContent value="preview" className="pt-2">
                <div className="p-4 border rounded  whitespace-pre-wrap">
                  {summary.replace(/\\n/g, "\n")}
                </div>
              </TabsContent>
              <TabsContent value="edit" className="pt-2">
                <AutoResizeTextarea
                  value={editedSummary}
                  onChange={(e) => setEditedSummary(e.target.value)}
                  className="min-h-[150px] w-full p-2 border rounded whitespace-pre-wrap"
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
}
