"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import TableSkeleton from "../../../add-new-audit/components/tableSkeleton";
import CustomButton from "@/components/common/CustomButton";
import { DEMO_SUMMARY } from "@/lib/demo-data";

export default function DemoResult() {
  const router = useRouter();

  const [resultData, setResultData] = useState<{
    totalScore: number;
    categoryScores: Array<{
      categoryId: string;
      categoryName: string;
      score: number;
      maxScore: number;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const summaryData = DEMO_SUMMARY;

  useEffect(() => {
    // Load data from sessionStorage
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("testResultData");
        if (stored) {
          const data = JSON.parse(stored);
          setResultData(data);
        } else {
          toast.error("No demo data found. Please answer some questions first.");
          router.push("/demo?category=1");
          return;
        }
      } catch (error) {
        console.error("Error loading demo result:", error);
        toast.error("Failed to load demo result.");
        router.push("/demo?category=1");
      } finally {
        setLoading(false);
      }
    }
  }, [router]);

  if (loading || !resultData) {
    return <TableSkeleton />;
  }

  const categoryScoresWithData = resultData.categoryScores.map((cs) => {
    const percentage = cs.maxScore > 0 ? (cs.score / cs.maxScore) * 100 : 0;
    return { ...cs, percentage };
  });

  const lastThreeCategories = [...categoryScoresWithData]
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 3);

  const firstFourCategories = [...categoryScoresWithData]
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 4);

  const getRecommendationForCategory = (categoryId: string): string => {
    const rec = summaryData.categoryRecommendations.find(r => r.categoryId === categoryId);
    return rec?.recommendation || "";
  };

  const totalMaxScore = resultData.categoryScores.reduce((sum, cs) => sum + cs.maxScore, 0);
  const totalScore = resultData.totalScore;
  const totalPercentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

  return (
    <div className="" style={{ backgroundColor: "#f5f5f5" }}>
      <div className="h-full bg-white">
        <div className="max-w-full mx-auto px-6 py-4">
          {/* SUMMARY SCORE Section */}
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div className="2xl:flex gap-20">
                <h1 className="text-[1.75rem] 2xl:text-[35px] text-nowrap text-[#2D2D2D] mb-3 2xl:mb-1 uppercase">
                  DEMO SUMMARY SCORE
                </h1>
                <div>
                  <h2 className="text-[1.60rem] 2xl:text-[35px] text-[#2B4055] mb-1">
                    YOUR PERFORMANCE INSIGHTS
                  </h2>
                  <p className="text-gray-600 text-[17px] 2xl:text-[25px] leading-8 mb-3 2xl:mb-0">
                    This is a demo of your overall performance score. In a real audit, this score would reflect your current standing across all evaluated categories.
                  </p>
                </div>
              </div>

              {/* Circular Gauge */}
              <div className="shrink-0 ml-4">
                {(() => {
                  const size = 112;
                  const center = size / 2;
                  const radius = 50;
                  const circumference = 2 * Math.PI * radius;
                  const offset = circumference - (totalPercentage / 100) * circumference;

                  let progressColor = "#2CD573";
                  if (totalPercentage < 33.33) progressColor = "#F65355";
                  else if (totalPercentage < 66.66) progressColor = "#F7AF41";

                  return (
                    <div className="relative" style={{ width: `${size}px`, height: `${size}px` }}>
                      <svg className="transform -rotate-90" width={size} height={size}>
                        <circle cx={center} cy={center} r={radius} stroke="#2B4055" strokeWidth="3" fill="none" />
                        <circle cx={center} cy={center} r={radius} stroke={progressColor} strokeWidth="8" fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s" }} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[#2d3e50] font-semibold" style={{ fontSize: "50px", lineHeight: "1" }}>{totalScore}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* AUDIT TOTAL SCORE Progress Bar */}
            <div className="relative rounded-lg mt-4">
              <h3 className="text-[1.20rem] 2xl:text-[21px] font-normal text-gray-800 uppercase">
                DEMO TOTAL SCORE ({totalScore} / {totalMaxScore})
              </h3>
              <div className="relative w-full h-[18px] mt-2 flex items-center rounded-full bg-gray-200">
                <div className="absolute inset-y-0 left-0 h-[18px] bg-[#F65355] z-20 rounded-l-full" style={{ width: "33.33%" }}></div>
                <div className="absolute inset-y-0 h-[18px] bg-[#F7AF41] z-10" style={{ left: "33.33%", width: "33.33%" }}></div>
                <div className="absolute inset-y-0 h-[18px] bg-[#2BD473] z-0 rounded-r-full" style={{ left: "66.66%", width: "33.34%" }}></div>
                <div className="absolute transition-all duration-500 z-30" style={{ left: `${totalPercentage}%`, top: "50%", transform: "translate(-50%, -50%)" }}>
                  <div className="px-2 h-[42px] bg-[#456987] rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-[2rem]">{totalScore}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* VISUAL BREAKDOWN RESULTS Section */}
          <div className="mb-3 border-t pt-4 border-gray-300">
            <h2 className="text-[1.5rem] 2xl:text-[35px] text-[#2D2D2D] mb-2 uppercase">
              VISUAL BREAKDOWN RESULTS
            </h2>
            <div className="bg-[#EFEFEF] p-5 px-6 rounded-lg">
              <div className="grid grid-cols-4 text-center gap-5 mb-3">
                {firstFourCategories.map((cs) => {
                  let borderColor = "#209150";
                  let bgColor = "rgba(32, 145, 80, 0.1)";
                  if (cs.percentage < 40) {
                    borderColor = "#F65355";
                    bgColor = "rgba(246, 83, 85, 0.1)";
                  } else if (cs.percentage < 80) {
                    borderColor = "#F7AF41";
                    bgColor = "rgba(247, 175, 65, 0.1)";
                  }

                  return (
                    <div key={cs.categoryId} className="px-4 py-2 truncate text-lg rounded-2xl font-semibold uppercase border-2" style={{ borderColor, backgroundColor: bgColor, color: "#2B4055" }}>
                      {cs.categoryName}
                    </div>
                  );
                })}
              </div>
              <p className="text-[17px] 2xl:text-[20px] font-light">
                This visual breakdown highlights your performance across the four Audit categories. Red indicates areas needing focus, orange shows room for improvement, and green demonstrates strength.
              </p>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-6 mb-2 border-y py-2 border-gray-300">
            {/* Left Column - IMPROVEMENT RECOMMENDATIONS */}
            <div className="border-r pr-6 border-gray-300">
              <h2 className="text-[1.5rem] 2xl:text-[35px] text-[#2D2D2D] mb-4 uppercase">
                IMPROVEMENT RECOMMENDATIONS
              </h2>
              <div className="space-y-2">
                {lastThreeCategories.map((cs, index) => (
                  <div key={cs.categoryId} className={`pb-1 ${index === lastThreeCategories.length - 1 ? "" : "border-b min-h-20 line-clamp-3 border-gray-300"}`}>
                    <p className="text-gray-600 text-[17px] 2xl:text-[20px] leading-relaxed">
                      <span className="text-[#2B4055] font-bold">{cs.categoryName}:</span>{" "}
                      {getRecommendationForCategory(cs.categoryId)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - NEXT STEPS */}
            <div>
              <h2 className="text-[1.5rem] 2xl:text-[35px] text-[#2D2D2D] mb-3 uppercase">
                WHAT ARE THE NEXT STEPS?
              </h2>
              <div className="space-y-3 mb-3 grid grid-cols-3 gap-4">
                {summaryData.nextSteps.map((step, index) => (
                  <div key={index} className="w-full h-full px-4 py-3 border-2 rounded-lg text-left min-h-20 border-gray-300">
                    <p className="text-gray-600">{step.content}</p>
                  </div>
                ))}
              </div>
              <p className="text-gray-600 text-[17px] 2xl:text-[20px] font-light">
                {summaryData.overallDetails}
              </p>
            </div>
          </div>

          {/* SKIP THE LINE */}
          <div className="text-center bg-[#EFEFEF] py-3 2xl:py-4 mt-2 2xl:mt-4 rounded-xl">
            <h2 className="text-[1.5rem] 2xl:text-[1.8rem] font-semibold text-[#2D2D2D] mb-2 uppercase">
              Want to Skip the Line?
            </h2>
            <p className="text-[17px] 2xl:text-[19px] mb-3 max-w-7xl mx-auto">
              Ready to eliminate your conversion leaks immediately? Schedule a strategy call to map out your personalized Pipeline Conversion Kit.
            </p>
            <button className="h-10 px-8 text-black font-semibold bg-[#F7AF41] hover:bg-[#F7AF41]/90 text-[23px] rounded-xl">
              Book Your Call Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
