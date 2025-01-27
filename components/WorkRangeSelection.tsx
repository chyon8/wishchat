import React from "react";
import { Button } from "@/components/ui/button";

interface WorkRangeSelectionProps {
  selected?: string[];
  onChange?: (newSelected: string[]) => void;
}

const WorkRangeSelection: React.FC<WorkRangeSelectionProps> = ({
  selected = [],
  onChange,
}) => {
  const workRanges = ["기획", "디자인", "개발"] as const;

  const toggleRange = (range: string) => {
    if (selected.includes(range)) {
      if (selected.length > 1) {
        onChange?.(selected.filter((r) => r !== range));
      }
    } else {
      onChange?.([...selected, range]);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">업무 범위</h3>
      <div className="flex flex-wrap gap-2">
        {workRanges.map((range) => {
          const isSelected = selected.includes(range);
          return (
            <Button
              key={range}
              variant="outline"
              onClick={() => toggleRange(range)}
              className={`w-24 h-10 ${
                isSelected
                  ? "bg-black text-white hover:bg-black hover:text-white"
                  : "bg-white text-black hover:bg-black/10"
              }`}
            >
              {range}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default WorkRangeSelection;
