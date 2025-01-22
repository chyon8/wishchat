import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { POSITION_SALARY } from "./constants/salary";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 견적 계산 함수
export const calculateEstimation = (estimation: {
  manmonth: {
    frontend: number;
    backend: number;
    designer: number;
    planner: number;
    pm: number;
  };
}) => {
  const costs = {
    frontend: estimation.manmonth.frontend * POSITION_SALARY.frontend,
    backend: estimation.manmonth.backend * POSITION_SALARY.backend,
    designer: estimation.manmonth.designer * POSITION_SALARY.designer,
    planner: estimation.manmonth.planner * POSITION_SALARY.planner,
    pm: estimation.manmonth.pm * POSITION_SALARY.pm,
  };

  const totalCost = Object.values(costs).reduce((acc, curr) => acc + curr, 0);

  // 0.5, 0.6, 0.7, 0.8, 0.9, 1을 곱한 값들을 배열로 반환
  const adjustedCosts = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map(
    (factor) => totalCost * factor
  );

  return {
    manmonth: estimation.manmonth,
    costs,
    totalCost,
    adjustedCosts, // 0.5, 0.6, 0.7, 0.8, 0.9, 1을 곱한 값들
  };
};
