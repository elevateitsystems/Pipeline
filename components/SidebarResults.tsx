"use client";

import React from "react";

interface SidebarResultsProps {
  testResultData: {
    categoryScores: Array<{
      categoryId: string;
      categoryName: string;
      score: number;
      maxScore: number;
    }>;
  } | null;
  secondaryColor?: string;
}

const SidebarResults = ({
  testResultData,
  secondaryColor,
}: SidebarResultsProps) => {
  return (
    <div className="px-4 pt-4 2xl:pt-6">
      <h3
        className="text-[1.5rem] 2xl:text-[1.75rem] leading-8 2xl:text-nowrap text-[#F7FCFF] mb-4 2xl:mb-[60px]"
        style={{ fontFamily: "'Acumin Variable Concept', sans-serif" }}
      >
        Area Of Urgent Focus
      </h3>
      <div className="space-y-2 2xl:space-y-3">
        {testResultData &&
          (() => {
            const urgentCategories = [...testResultData.categoryScores]
              .filter((cs) => cs.categoryName.toLowerCase() !== "summary")
              .sort((a, b) => {
                const aPercentage =
                  a.maxScore > 0 ? (a.score / a.maxScore) * 100 : 0;
                const bPercentage =
                  b.maxScore > 0 ? (b.score / b.maxScore) * 100 : 0;
                return aPercentage - bPercentage;
              })
              .slice(0, 3);

            return urgentCategories.map((cs) => {
              const percentage =
                cs.maxScore > 0 ? (cs.score / cs.maxScore) * 100 : 0;
              return (
                <div key={cs.categoryId} className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className="text-white overflow-hidden text-[20px] 2xl:text-[25px] text-nowrap truncate"
                      style={{
                        fontFamily: "'Acumin Variable Concept', sans-serif",
                      }}
                    >
                      {cs.categoryName}
                    </span>
                  </div>
                  <div
                    className="w-full h-4 border-2 rounded-full overflow-hidden"
                    style={{ borderColor: secondaryColor || "#456987" }}
                  >
                    <div
                      className="h-full bg-[#F65355] transition-all duration-500"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            });
          })()}
      </div>
    </div>
  );
};

export default SidebarResults;
