/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import AutoResizeTextarea from "@/components/AutoResizeTextarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";

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

export default function Inspection() {
  const [memo, setMemo] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [editedSummary, setEditedSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("preview");
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // 로컬 스토리지에서 데이터 불러오기
  useEffect(() => {
    const savedMemo = localStorage.getItem("memo");
    const savedSummary = localStorage.getItem("summary");
    if (savedMemo) setMemo(savedMemo);
    if (savedSummary) {
      setSummary(savedSummary);
      // 에디터에 표시할 때도 줄바꿈 처리
      setEditedSummary(savedSummary.replace(/\\n/g, "\n"));
    }
  }, []);

  // 메모와 요약을 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem("memo", memo);
  }, [memo]);

  useEffect(() => {
    localStorage.setItem("summary", summary);
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
      const response = await fetch("/api/inspection/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers: [{ text: memo }] }),
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

  const handleNewMemo = () => {
    setMemo("");
    setSummary("");
    setEditedSummary("");
    localStorage.removeItem("memo");
    localStorage.removeItem("summary");
  };

  // Word 문서로 다운로드하는 함수
  const handleDownloadAsWord = async () => {
    setIsDownloading(true);
    try {
      // 현재 활성화된 탭에 따라 다운로드할 내용 선택
      const contentToDownload =
        activeTab === "edit" ? editedSummary : summary.replace(/\\n/g, "\n");

      const title = "서비스 기획서";
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const filename = `${title}_${timestamp}.docx`;

      // 서버로 요청 보내기 (서버 측에서 Word 문서 생성)
      const response = await fetch("/api/document/generate-word", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
          content: contentToDownload,
          originalMemo: memo,
        }),
      });

      if (!response.ok) throw new Error("Word 문서 생성 실패");

      // 응답을 Blob으로 받기
      const blob = await response.blob();

      // 다운로드 링크 생성
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename;

      // 링크 클릭으로 다운로드 트리거
      document.body.appendChild(a);
      a.click();

      // 리소스 정리
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Word 문서 다운로드 오류:", error);
      alert("문서 다운로드 중 오류가 발생했습니다.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">메모 요약</h2>
        <AutoResizeTextarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="메모를 입력하세요..."
          className="min-h-[100px] w-full p-2 border rounded"
        />
        <div className="flex space-x-2">
          <Button onClick={handleSummary} disabled={isLoading || !memo.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                요약 생성 중...
              </>
            ) : (
              "요약 생성"
            )}
          </Button>
          <Button variant="outline" onClick={handleNewMemo}>
            새로운 메모
          </Button>
        </div>
      </div>

      {summary && (
        <div className="space-y-2">
          <h2 className="text-xl font-bold">요약 결과</h2>
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
                <div className="p-4 border rounded bg-gray-50 whitespace-pre-wrap">
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
          <Button
            variant="outline"
            onClick={handleDownloadAsWord}
            disabled={isDownloading || !summary}
            className="ml-2"
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                다운로드 중...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Word로 다운로드
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
