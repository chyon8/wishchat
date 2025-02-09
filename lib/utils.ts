import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { POSITION_SALARY } from "./constants/salary";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 견적 계산 함수
export const calculateEstimation = (
  estimation: {
    frontend: number;
    backend: number;
    designer: number;
    planner: number;
    pm: number;
  },
  workRange: string[]
) => {
  // workRange에 포함되지 않은 역할은 0으로 처리
  const adjustedEstimation = {
    frontend: workRange.includes("개발") ? estimation.frontend : 0,
    backend: workRange.includes("개발") ? estimation.backend : 0,
    designer: workRange.includes("디자인") ? estimation.designer : 0,
    planner: workRange.includes("기획") ? estimation.planner : 0,
    pm: estimation.pm,
  };

  const costs = {
    frontend: adjustedEstimation.frontend * POSITION_SALARY.frontend,
    backend: adjustedEstimation.backend * POSITION_SALARY.backend,
    designer: adjustedEstimation.designer * POSITION_SALARY.designer,
    planner: adjustedEstimation.planner * POSITION_SALARY.planner,
    pm: adjustedEstimation.pm * POSITION_SALARY.pm,
  };

  const totalCost = Object.values(costs).reduce((acc, curr) => acc + curr, 0);
  const optimalEstimate = totalCost * 0.8;
  const hoguma = optimalEstimate / 2;
  const maxEstimate = totalCost * 1.0;

  /*
  // 0.5, 0.6, 0.7, 0.8, 0.9, 1을 곱한 값들을 배열로 반환
  const adjustedCosts = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map(
    (factor) => totalCost * factor
  );
*/
  return {
    manmonth: adjustedEstimation,
    costs,
    totalCost,
    hoguma,
    maxEstimate,
    // adjustedCosts, // 0.5, 0.6, 0.7, 0.8, 0.9, 1을 곱한 값들
  };
};
