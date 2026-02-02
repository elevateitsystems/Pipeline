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
}

const SidebarResults = ({ testResultData }: SidebarResultsProps) => {
  return (
    <div className="px-4 mt-4">
      <h3
        className="text-lg text-white mb-3 uppercase"
        style={{ fontFamily: "'Acumin Variable Concept', sans-serif" }}
      >
        Area Of Urgent Focus
      </h3>
      <div className="space-y-3">
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
                      className="text-white text-sm text-nowrap"
                      style={{
                        fontFamily: "'Acumin Variable Concept', sans-serif",
                      }}
                    >
                      {cs.categoryName}
                    </span>
                  </div>
                  <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
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
