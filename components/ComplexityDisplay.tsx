import { Card, CardContent } from "@/components/ui/card";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ComplexityDisplay({
  complexity,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
any) {
  if (!complexity) return null;

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold">복잡도 평가</h2>
          <div className="space-y-2">
            <div className="space-y-1">
              <p>
                <span className="font-bold">복잡도: </span>
                {complexity.complexity}{" "}
              </p>
            </div>
            <div className="space-y-1">
              <p>
                <span className="font-bold">근거: </span>
                {complexity.reasonComplexity}{" "}
              </p>
              <p className="text-sm text-slate-600">
                * mid는 복잡도 중~상을 의미
              </p>
              <p className="text-sm text-slate-600">
                * easy는 복잡도 하를 의미
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
