import * as React from "react";

interface AnswerItem {
  question: string;
  answer: string | string[];
  type: string;
  questionData: {
    text: string;
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: any[];
  };
}

interface ProjectData {
  overview: string; // 프로젝트 개요
  requirements: string[]; // 요구사항 리스트
  environment: string; // 개발 환경
  features: string[]; // 주요 기능 리스트
  answer: AnswerItem[];
}

interface EmailTemplateProps {
  email: string;
  phone: string;
  projectData: ProjectData;
}

export const EmailTemplate = ({
  phone,
  email,
  projectData,
}: EmailTemplateProps) => {
  const formattedData = projectData.answer
    .map(
      (item, index) =>
        `질문 ${index + 1}: ${item.question}\n대답 ${index + 1}: ${
          Array.isArray(item.answer) ? item.answer.join(", ") : item.answer
        }`
    )
    .join("\n\n");

  return (
    <div>
      <div>
        <h3 className="font-semibold">클라이언트 정보</h3>
        <ul>
          <li>이메일: {email}</li>
          <li>전화번호: {phone}</li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold">프로젝트 개요</h3>
        <p>{projectData.overview}</p>
      </div>
      <div>
        <h3 className="font-semibold">필요 요소</h3>
        <ul className="list-disc pl-5">
          {projectData.requirements.map((req, i) => (
            <li key={i}>{req}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold">개발 환경/언어</h3>
        <p>{projectData.environment}</p>
      </div>
      <div>
        <h3 className="font-semibold">주요 기능</h3>
        <ul className="list-disc pl-5">
          {projectData.features.map((feature, i) => (
            <li key={i}>{feature}</li>
          ))}
        </ul>
      </div>
      {/* 원래 대답 데이터 */}
      <div>
        <h3 className="font-semibold">질문 및 답변 원문</h3>
        <pre>{formattedData}</pre>
      </div>
    </div>
  );
};
