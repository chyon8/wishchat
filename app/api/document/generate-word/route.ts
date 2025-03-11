import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as docx from "docx";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from "docx";

export async function POST(req: NextRequest) {
  try {
    const { title, content } = await req.json();

    // 현재 날짜 및 시간 포맷팅
    const now = new Date();
    const dateString = now.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const dateTimeString = `${dateString}`;

    // 문서 생성
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // 제목
            new Paragraph({
              text: title,
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: {
                after: 200,
              },
            }),

            // 날짜 및 시간
            new Paragraph({
              text: `작성일: ${dateTimeString}`,
              alignment: AlignmentType.RIGHT,
              spacing: {
                after: 400,
              },
            }),

            // 요약 부분 제목
            new Paragraph({
              text: "요약 내용",
              heading: HeadingLevel.HEADING_2,
              spacing: {
                before: 200,
                after: 200,
              },
              border: {
                bottom: {
                  color: "auto",
                  space: 1,
                  style: BorderStyle.SINGLE,
                  size: 6,
                },
              },
            }),

            // 요약 내용 (줄바꿈 처리)
            ...content.split("\n").map(
              (line: string) =>
                new Paragraph({
                  text: line || " ", // 빈 줄은 공백 하나로 처리
                  spacing: {
                    line: 360, // 1.5 줄 간격
                  },
                })
            ),

            // 푸터
            new Paragraph({
              text: "",
              spacing: {
                before: 400,
              },
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "이 문서는 위시켓에서 작성되었습니다.",
                  size: 18,
                  color: "808080",
                }),
              ],
            }),
          ],
        },
      ],
    });

    // 문서를 바이너리로 변환
    const buffer = await Packer.toBuffer(doc);

    // 응답 반환
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="memo_summary.docx"`,
      },
    });
  } catch (error) {
    console.error("Word 문서 생성 오류:", error);
    return NextResponse.json(
      { error: "Word 문서 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
