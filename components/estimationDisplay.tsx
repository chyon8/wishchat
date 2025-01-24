import { calculateEstimation } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function EstimationDisplay({ estimation, workRange }: any) {
  if (!estimation) return null;

  const result = calculateEstimation(estimation, workRange);

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold">예상 견적</h2>
          <div className="space-y-2">
            <div className="space-y-1">
              <p className="font-bold">필요 인력 (맨먼스):</p>
              <ul className="pl-4">
                <li>프론트엔드: {result.manmonth.frontend}MM</li>
                <li>백엔드: {result.manmonth.backend}MM</li>
                <li>디자이너: {result.manmonth.designer}MM</li>
                <li>기획자: {result.manmonth.planner}MM</li>
                <li>PM: {result.manmonth.pm}MM</li>
              </ul>
            </div>

            <div className="space-y-1">
              <p className="font-bold mt-4">총 예상 비용:</p>
              <ul className="pl-4">
                {result.adjustedCosts.map((cost: number, index: number) => (
                  <li key={index}>
                    <span className="font-bold">
                      단가 {(1.5 + index * 0.1).toFixed(1)}:{" "}
                    </span>
                    {cost.toLocaleString()}원
                  </li>
                ))}
              </ul>
              <div className="space-y-1">
                <p className="font-bold mt-4">근거 설명:</p>{" "}
                <p className="pl-4">{estimation.reason}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
