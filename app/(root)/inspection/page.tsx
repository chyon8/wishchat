"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import AutoResizeTextarea from "@/components/AutoResizeTextarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";

export default function Inspection() {
  const [memo, setMemo] = useState("");
  const [summary, setSummary] = useState("");
  const [editedSummary, setEditedSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");

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
      const data = await response.json();
      const newSummary = JSON.stringify(data.summary, null, 2);
      setSummary(newSummary);
      // 에디터에 표시할 때는 줄바꿈 처리
      setEditedSummary(newSummary.replace(/\\n/g, "\n"));
    } catch (error) {
      console.error("요약 오류:", error);
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
          <Tabs
            defaultValue="preview"
            value={activeTab}
            onValueChange={setActiveTab}
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
      )}
    </div>
  );
}
