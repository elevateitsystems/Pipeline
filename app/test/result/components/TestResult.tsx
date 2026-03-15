"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAudit } from "@/lib/hooks";
import { Presentation } from "@/lib/types";
import toast from "react-hot-toast";
import Image from "next/image";
import TableSkeleton from "../../../add-new-audit/components/tableSkeleton";
import { CustomButton } from "@/components/common";

export default function TestResult() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presentationId = searchParams.get("presentationId");

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

  // Fetch audit data which includes summary
  const { data: auditData } = useAudit(presentationId);

  // Get summary data from audit data (summary is included in the API response)
  const summaryData =
    auditData && "summary" in auditData
      ? (
        auditData as Presentation & {
          summary?: {
            categoryRecommendations?:
            | string
            | Array<{ categoryId: string; recommendation: string }>;
            nextSteps?:
            | string
            | Array<{ type: string; content: string; fileUrl?: string }>;
            overallDetails?: string | null;
          } | null;
        }
      )?.summary || null
      : null;

  useEffect(() => {
    if (!presentationId) {
      toast.error("Presentation ID is missing");
      router.push("/");
      return;
    }

    // Load data from sessionStorage
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("testResultData");
        if (stored) {
          const data = JSON.parse(stored);
          setResultData(data);
        } else {
          toast.error(
            "No test data found. Please answer some questions first.",
          );
          router.push(`/test?presentationId=${presentationId}&category=1`);
          return;
        }
      } catch (error) {
        console.error("Error loading test result:", error);
        toast.error("Failed to load test result. Please try again.");
        router.push(`/test?presentationId=${presentationId}&category=1`);
      } finally {
        setLoading(false);
      }
    }
  }, [presentationId, router]);

  if (loading || !resultData) {
    return <TableSkeleton />;
  }

  // Filter out summary category from category scores
  const filteredCategoryScores = resultData.categoryScores.filter(
    (cs) => cs.categoryName.toLowerCase() !== "summary",
  );

  // Calculate total max score (excluding summary)
  const totalMaxScore = filteredCategoryScores.reduce((sum, cs) => {
    return sum + cs.maxScore;
  }, 0);

  // Calculate total score (excluding summary)
  const totalScore = filteredCategoryScores.reduce((sum, cs) => {
    return sum + cs.score;
  }, 0);

  // Get category scores with percentages (already filtered)
  const categoryScoresWithData = filteredCategoryScores.map((cs) => {
    const percentage = cs.maxScore > 0 ? (cs.score / cs.maxScore) * 100 : 0;
    return {
      ...cs,
      percentage,
    };
  });

  // Sort by score (lowest first for "Area Of Urgent Focus") - last 3 scores
  const lastThreeCategories = [...categoryScoresWithData]
    .sort((a, b) => {
      const aPercentage = a.maxScore > 0 ? (a.score / a.maxScore) * 100 : 0;
      const bPercentage = b.maxScore > 0 ? (b.score / b.maxScore) * 100 : 0;
      return aPercentage - bPercentage;
    })
    .slice(0, 3);

  // First 4 scores for visual breakdown (sorted by score, highest first)
  const firstFourCategories = [...categoryScoresWithData]
    .sort((a, b) => {
      const aPercentage = a.maxScore > 0 ? (a.score / a.maxScore) * 100 : 0;
      const bPercentage = b.maxScore > 0 ? (b.score / b.maxScore) * 100 : 0;
      return bPercentage - aPercentage;
    })
    .slice(0, 4);

  // Get recommendations for last 3 categories from summary data
  const getRecommendationForCategory = (categoryId: string): string => {
    if (!summaryData?.categoryRecommendations) return "";
    const recommendations =
      typeof summaryData.categoryRecommendations === "string"
        ? JSON.parse(summaryData.categoryRecommendations)
        : summaryData.categoryRecommendations;
    if (Array.isArray(recommendations)) {
      const rec = recommendations.find(
        (r: { categoryId: string; recommendation: string }) =>
          r.categoryId === categoryId,
      );
      return rec?.recommendation || "";
    }
    return "";
  };

  return (
    <div
      className=""
      style={{
        backgroundColor: "#f5f5f5",
        fontFamily: "'Acumin Variable Concept', sans-serif",
      }}
    >
      {/* Right Main Content - 80% width */}
      <div className=" h-full bg-white">
        <div className="max-w-full mx-auto px-6 py-4">
          {/* SUMMARY SCORE Section */}
          <div className="mb-6">
            <div className="flex justify-between items-start ">
              <div className="xl:flex gap-20">
                <h1 className="text-[2rem] text-nowrap text-[#2D2D2D] mb-4 xl:mb-1">
                  SUMMARY SCORE
                </h1>
                <div>
                  <h2 className="text-[2rem]  text-[#2B4055] mb-1">
                    YOUR SALES CONVERSION SCORE
                  </h2>
                  <p className="text-gray-600 text-[1.56rem] leading-8">
                    Your overall performance score based on the audit
                    . This score reflects your current standing across
                    all evaluated categories and provides insight into your
                    sales conversion effectiveness.
                  </p>
                </div>
              </div>

              {/* Circular Gauge */}
              <div className="shrink-0 ml-4">
                {(() => {
                  const totalPercentage =
                    totalMaxScore > 0
                      ? Math.min((totalScore / totalMaxScore) * 100, 100)
                      : 0;
                  const size = 112;
                  const center = size / 2;
                  const radius = 50;
                  const circumference = 2 * Math.PI * radius;
                  const offset =
                    circumference - (totalPercentage / 100) * circumference;

                  // Determine color based on percentage
                  let progressColor = "#2CD573"; // Green (default)
                  if (totalPercentage < 33.33) {
                    progressColor = "#F65355"; // Red
                  } else if (totalPercentage < 66.66) {
                    progressColor = "#F7AF41"; // Orange
                  }

                  return (
                    <div
                      className="relative"
                      style={{ width: `${size}px`, height: `${size}px` }}
                    >
                      <svg
                        className="transform -rotate-90"
                        width={size}
                        height={size}
                        style={{ width: `${size}px`, height: `${size}px` }}
                      >
                        {/* Background circle */}
                        <circle
                          cx={center}
                          cy={center}
                          r={radius}
                          stroke="#2B4055"
                          strokeWidth="3"
                          fill="none"
                        />
                        {/* Progress circle */}
                        <circle
                          cx={center}
                          cy={center}
                          r={radius}
                          stroke={progressColor}
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={circumference}
                          strokeDashoffset={offset}
                          strokeLinecap="round"
                          style={{
                            transition:
                              "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        />
                      </svg>
                      {/* Score in center */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className="text-[#2d3e50] font-semibold"
                          style={{ fontSize: "50px", lineHeight: "1" }}
                        >
                          {totalScore}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* AUDIT TOTAL SCORE Progress Bar */}
            <div className="relative rounded-lg">
              <h3 className="text-[21px] font-semibold text-gray-800  uppercase">
                AUDIT TOTAL SCORE ({totalScore} / {totalMaxScore})
              </h3>
              <div className="relative w-full h-[18px] mt-2 flex items-center rounded-full ">
                {/* Red section - 0-33.33% */}
                <div
                  className="absolute inset-y-0 left-0 h-[18px] bg-[#F65355] z-20 rounded-l-full"
                  style={{ width: "33.33%" }}
                ></div>
                {/* Yellow section - 33.33-66.66% */}
                <div
                  className="absolute inset-y-0 h-[18px] bg-[#F7AF41] z-10 "
                  style={{ left: "33.33%", width: "33.33%" }}
                ></div>
                {/* Green section - 66.66-100% */}
                <div
                  className="absolute inset-y-0 h-[18px] bg-[#2BD473] z-0 rounded-r-full"
                  style={{ left: "66.66%", width: "33.34%" }}
                ></div>
                {/* Score indicator */}
                <div
                  className="absolute transition-all duration-500 z-30"
                  style={{
                    left: `${totalMaxScore > 0 ? Math.min((totalScore / totalMaxScore) * 100, 100) : 0}%`,
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div className="px-2 h-[42px] bg-[#456987] rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-[2rem]">
                      {totalScore}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* VISUAL BREAKDOWN RESULTS Section */}
          <div className="mb-3 border-t pt-4 border-gray-300">
            <h2 className="text-[2rem] text-[#2D2D2D] mb-2">
              VISUAL BREAKDOWN RESULTS
            </h2>
            <div className="bg-[#EFEFEF] p-5 px-6 rounded-lg">
              <div className="grid grid-cols-4 text-center gap-5 mb-3 ">
                {firstFourCategories.map((cs) => {
                  // Calculate percentage for this category
                  const percentage =
                    cs.maxScore > 0 ? (cs.score / cs.maxScore) * 100 : 0;
                  // Determine color based on percentage
                  let borderColor: string;
                  let bgColor: string;
                  if (percentage < 40) {
                    borderColor = "#F65355"; // Red
                    bgColor = "rgba(246, 83, 85, 0.1)"; // Red with 10% opacity
                  } else if (percentage < 80) {
                    borderColor = "#F7AF41"; // Orange
                    bgColor = "rgba(247, 175, 65, 0.1)"; // Orange with 10% opacity
                  } else {
                    borderColor = "#209150"; // Green
                    bgColor = "rgba(32, 145, 80, 0.1)"; // Green with 10% opacity
                  }

                  return (
                    <div
                      key={cs.categoryId}
                      className="px-4 py-2 truncate text-lg rounded-2xl font-semibold uppercase border-2"
                      style={{
                        borderColor: borderColor,
                        backgroundColor: bgColor,
                        color: "#2B4055",
                      }}
                    >
                      {cs.categoryName}
                    </div>
                  );
                })}
              </div>
              <p className="text-gray-600 text-[20px] leading-relaxed">
                The visual breakdown above represents your performance across
                the top four categories. Each category is color-coded based on
                your score: red indicates areas requiring urgent attention,
                orange shows average performance with room for improvement, and
                green demonstrates strong performance. Use this breakdown to
                prioritize your improvement efforts and focus on the categories
                that need the most attention.
              </p>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-6 mb-2 border-y py-2 border-gray-300">
            {/* Left Column - IMPROVEMENT RECOMMENDATIONS */}
            <div className="border-r pr-6 border-gray-300">
              <h2 className="text-[2rem] text-[#2D2D2D] mb-4">
                IMPROVEMENT RECOMMENDATIONS
              </h2>
              <div className="space-y-4">
                {lastThreeCategories.map((cs, index) => {
                  const recommendation = getRecommendationForCategory(
                    cs.categoryId,
                  );
                  return (
                    <div
                      key={cs.categoryId}
                      className={`pb-1 ${index === lastThreeCategories.length - 1 ? "" : "border-b min-h-20 line-clamp-3 border-gray-300"}`}
                    >
                      <p className="text-gray-600 text-[20px] leading-relaxed">
                        <span className="text-[#2B4055] font-bold">{cs.categoryName}:</span> {recommendation ||
                          "No specific recommendations available for this category."}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column - WHAT ARE THE NEXT STEPS? */}
            <div>
              <h2 className="text-[2rem] text-[#2D2D2D] mb-3">
                WHAT ARE THE NEXT STEPS?
              </h2>
              <div className="space-y-3 mb-3 grid grid-cols-3 gap-4">
                {(() => {
                  const nextSteps = summaryData?.nextSteps
                    ? typeof summaryData.nextSteps === "string"
                      ? JSON.parse(summaryData.nextSteps)
                      : summaryData.nextSteps
                    : [];
                  return Array.isArray(nextSteps) && nextSteps.length > 0
                    ? nextSteps
                      .slice(0, 3)
                      .map(
                        (
                          step: {
                            type: string;
                            content: string;
                            fileUrl?: string;
                          },
                          index: number,
                        ) => (
                          <div
                            key={index}
                            className="w-full h-full px-4 py-3 border-2 bg-[rgba(239,239,239,0.40)] rounded-lg text-left min-h-20"
                          >
                            {step.type === "file" && step.fileUrl ? (
                              <div className="flex items-center gap-2">
                                <Image
                                  src={step.fileUrl}
                                  alt="Step"
                                  width={140}
                                  height={140}
                                  className="object-contain rounded w-full h-[120px]"
                                />
                              </div>
                            ) : (
                              <p className="text-gray-600">
                                {step.content ||
                                  `Enter step ${index + 1} details`}
                              </p>
                            )}
                          </div>
                        ),
                      )
                    : [1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className="w-full px-2 border-2 border-gray-300 rounded-lg h-28 flex items-center justify-center"
                      >
                        <p className="text-[20px] text-gray-400 font-light">
                          Enter step {step} details
                        </p>
                      </div>
                    ));
                })()}
              </div>
              <p className="text-gray-600 text-[20px] leading-relaxed">
                {summaryData?.overallDetails ||
                  "Based on your audit results, focus on implementing the recommended improvements in the areas with the lowest scores. Start with the most critical categories that require urgent attention, then work through the next steps systematically. Regular follow-up assessments will help you track your progress and ensure continuous improvement across all evaluated areas."}
              </p>
            </div>
          </div>

          {/* Want to Skip the Line? Section */}
          <div className="text-center bg-[#EFEFEF] py-4 mt-4 rounded-xl">
            <h2 className="text-[28px] font-semibold text-[#2D2D2D] mb-2">
              Want to Skip the Line?
            </h2>
            <p className="text-gray-600 text-[20px] leading-relaxed mb-3 max-w-7xl mx-auto">
              For action-takers ready to eliminate their conversion leaks
              immediately, schedule a strategy call. We&apos;ll map out how your
              personalized Pipeline Conversion Kit could look-so you can start
              closing confidently without rewriting your offer
            </p>
            <CustomButton className="h-8 px-6 inline-block text-black font-base hover:bg-[#F7AF41]/90 transition-colors text-[23px] rounded-xl">
              Book Your Call Now
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
}
