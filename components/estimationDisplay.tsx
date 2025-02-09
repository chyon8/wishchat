import { calculateEstimation } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function EstimationDisplay({
  estimation,
  workRange,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
any) {
  if (!estimation) return null;

  const result = calculateEstimation(estimation, workRange);

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold">예상 견적</h2>
          <div className="space-y-2">
            <div className="space-y-1">
              <p className="font-bold mt-4">예상 비용:</p>
              <span className="pl-6">{result.hoguma.toLocaleString()}원~</span>
              <span>{result.maxEstimate.toLocaleString()}원</span>
              <div className="space-y-1">
                <p className="font-bold mt-4">산정 근거:</p>{" "}
                <p className="pl-4">{estimation.reason}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
