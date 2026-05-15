"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NextImage from "next/image";
import { useUser } from "@/contexts/UserContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEMO_CATEGORIES, DEMO_QUESTIONS, DEMO_PRESENTATION, DEMO_SUMMARY } from "@/lib/demo-data";

export default function DemoPresentation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = parseInt(searchParams.get("category") || "1", 10);
  const { user } = useUser();

  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> optionId
  const [categoryScores, setCategoryScores] = useState<Record<string, number>>({}); // categoryId -> total score

  const primaryColor = user?.primaryColor || "#2B4055";

  // Helper functions for colors (Directly from TestPresentation)
  const getOptionBackgroundColor = (points: number): string => {
    switch (points) {
      case 1: return "#FFE2E3";
      case 2: return "#FFFCE2";
      case 3: return "#FFDBC2";
      case 4: return "#DCFCE7";
      case 5: return "#DCF3F6";
      default: return "#E8E8E8";
    }
  };

  const getOptionTextColor = (points: number): string => {
    switch (points) {
      case 1: return "#9F1239";
      case 2: return "#854D0E";
      case 3: return "#9A3412";
      case 4: return "#166534";
      case 5: return "#1E40AF";
      default: return "#333333";
    }
  };

  const getOptionColor = (points: number): string => {
    switch (points) {
      case 1: return "#FFB7B9";
      case 2: return "#E3D668";
      case 3: return "#894B00";
      case 4: return "#016730";
      case 5: return "#0EA5E9";
      default: return "#E8E8E8";
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("demoAnswers");
      if (stored) {
        setAnswers(JSON.parse(stored));
      }
    }
  }, []);

  useEffect(() => {
    const scores: Record<string, number> = {};
    DEMO_CATEGORIES.forEach((cat) => { scores[cat.id] = 0; });

    DEMO_QUESTIONS.forEach((q) => {
      const selectedOptionId = answers[q.id];
      if (selectedOptionId) {
        const option = q.options.find((opt: any) => opt.id === selectedOptionId);
        if (option) {
          scores[q.categoryId] = (scores[q.categoryId] || 0) + option.points;
        }
      }
    });

    setCategoryScores(scores);
    
    if (typeof window !== "undefined") {
      sessionStorage.setItem("demoAnswers", JSON.stringify(answers));
      
      const testResultData = {
        totalScore: Object.values(scores).reduce((sum, s) => sum + s, 0),
        categoryScores: DEMO_CATEGORIES.map((cat) => ({
          categoryId: cat.id,
          categoryName: cat.name,
          score: scores[cat.id] || 0,
          maxScore: DEMO_QUESTIONS.filter(q => q.categoryId === cat.id).length * 5,
        })),
      };
      sessionStorage.setItem("testResultData", JSON.stringify(testResultData));
      window.dispatchEvent(new Event("testResultUpdated"));
    }
  }, [answers]);

  const handleAnswerChange = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const navigateToResult = () => {
    router.push("/demo/result");
  };

  const getCategoryMaxScore = (categoryId: string): number => {
    return DEMO_QUESTIONS.filter((q) => q.categoryId === categoryId).length * 5;
  };

  const getCategoryPercentage = (categoryId: string): number => {
    const score = categoryScores[categoryId] || 0;
    const maxScore = getCategoryMaxScore(categoryId);
    return maxScore === 0 ? 0 : Math.min((score / maxScore) * 100, 100);
  };

  const currentCategoryData = DEMO_CATEGORIES[currentCategory - 1];
  const displayedQuestions = DEMO_QUESTIONS.filter(q => q.categoryId === currentCategoryData?.id);
  const currentCategoryScore = currentCategoryData ? categoryScores[currentCategoryData.id] || 0 : 0;
  const currentCategoryMaxScore = currentCategoryData ? getCategoryMaxScore(currentCategoryData.id) : 0;

  const CircularProgress = ({
    percentage,
    score,
    label,
  }: {
    percentage: number;
    score: number;
    label: string;
  }) => {
    const size = 90;
    const radius = 39.108;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className={`relative xl:size-${size}px lg:size-${size - 10}px size-${size - 20}px`}>
          <svg className="transform -rotate-90 hidden 2xl:block" width={size} height={size} viewBox="-4 -4 89 89" style={{ width: `size-${size}px`, height: `size-${size}px`, overflow: "visible" }}>
            <path d="M79.212 40.108C79.212 61.7034 61.7036 79.2157 40.1082 79.2157C18.5089 79.2157 1.00049 61.7034 1.00049 40.108C1.00049 18.5087 18.5089 1.00024 40.1082 1.00024C61.7036 1.00024 79.212 18.5087 79.212 40.108Z" stroke="#2B4055" strokeWidth="2.00052" strokeMiterlimit="10" fill="none" />
            <circle cx="40.108" cy="40.108" r="39.108" stroke="#2CD573" strokeWidth="8" fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }} />
          </svg>
          <svg className="transform -rotate-90 2xl:hidden" width={size - 20} height={size - 20} viewBox="-4 -4 89 89" style={{ width: `size-${size - 20}px`, height: `size-${size - 20}px`, overflow: "visible" }}>
            <path d="M79.212 40.108C79.212 61.7034 61.7036 79.2157 40.1082 79.2157C18.5089 79.2157 1.00049 61.7034 1.00049 40.108C1.00049 18.5087 18.5089 1.00024 40.1082 1.00024C61.7036 1.00024 79.212 18.5087 79.212 40.108Z" stroke="#2B4055" strokeWidth="2.00052" strokeMiterlimit="10" fill="none" />
            <circle cx="40.108" cy="40.108" r="39.108" stroke="#2CD573" strokeWidth="8" fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[#2B4055]" style={{ fontWeight: 600, fontSize: "clamp(24px, 3.5vw, 46px)", lineHeight: "100%", letterSpacing: "0.003em", fontVariationSettings: "'wdth' 65, 'wght' 700", textAlign: "center" }}>{score}</span>
          </div>
        </div>
        <p className="text-[#2B4055] text-center text-[19px] leading-tight line-clamp-1 mt-[17px]" style={{ fontWeight: 600, fontSize: "clamp(12px, 1.5vw, 19px)", lineHeight: "100%", letterSpacing: "0.003em", textAlign: "center", fontVariationSettings: "'wdth' 65, 'wght' 550" }}>{label}</p>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="">
        {/* Category Progress Circles */}
        <div className="bg-white pt-1 flex justify-center items-start gap-8 2xl:gap-16 w-full px-4">
          {DEMO_CATEGORIES.map((category) => {
            const categoryScore = categoryScores[category.id] || 0;
            const percentage = getCategoryPercentage(category.id);
            return (
              <CircularProgress
                key={category.id}
                percentage={percentage}
                score={categoryScore}
                label={category.name.toUpperCase()}
              />
            );
          })}
          {/* Summary Icon */}
          <div className="flex -mt-2 flex-col items-center cursor-pointer" onClick={navigateToResult}>
            <div className="size-20 2xl:size-24 flex items-center justify-center">
              <NextImage src="/searchIcon.png" alt="Summary Overview" width={48} height={48} className="size-10 2xl:size-12" />
            </div>
            <p className="pb-1 text-black text-center font-medium max-w-[100px] leading-tight uppercase" style={{ fontWeight: 500, fontSize: "clamp(12px, 1.5vw, 19px)", lineHeight: "100%", letterSpacing: "0.003em", fontVariationSettings: "'wdth' 65, 'wght' 500", textAlign: "center" }}>SUMMARY OVERVIEW</p>
          </div>
        </div>

        <div className="bg-white -mt-1 lg:max-xl:-mt-8 pt-4 2xl:pt-6 flex items-center justify-center gap-2 w-full ">
          <div className="bg-white flex items-center justify-center gap-2.5 w-full ">
            <p className="text-[14px] 2xl:text-[17px] uppercase tracking-[0.352px] leading-normal font-semibold pl-4 pt-1 xl:pl-0 text-nowrap text-[#212121]">
              GRADING SCALE (1-5)
            </p>
            <div className="flex xl:grid grid-cols-3 gap-[1.89px]">
              <p className="w-full text-[clamp(12px,1.2vw,17px)] uppercase font-medium bg-[#F65355] px-5 xl:px-[38px] py-2 pb-1 text-white rounded-tl-xl text-nowrap">
                1-2 URGENT ATTENTION
              </p>
              <p className="w-full text-[clamp(12px,1.2vw,17px)] uppercase font-medium bg-[#F7AF41] px-5 xl:px-[38px] py-2 pb-1 text-white text-nowrap">
                3-4 AVERAGE AUDIT
              </p>
              <p className="w-full text-[clamp(12px,1.2vw,17px)] uppercase font-medium bg-[#209150] px-5 xl:px-[38px] py-2 pb-1 text-white rounded-tr-xl text-nowrap">
                5 EXCELLENT AUDIT
              </p>
            </div>
          </div>
        </div>

        {/* Dark Header Bar (Pixel Perfect) */}
      <div
          className="flex items-center"
          style={{
            width: "100%",
            // paddingTop: "1px",
            // paddingBottom: "1px",
            alignItems: "center",
          }}
        >
          <p
            className="text-[clamp(14px,1.5vw,20px)] text-white capitalize font-500 leading-normal font-medium"
            style={{ width: "100px" }}
          ></p>
          <p
            style={{
              width: "calc(50% - 100px)",
              color: "#F4F4F4",
              fontWeight: 400,
              fontSize: "clamp(16px, 1.8vw, 22px)",
              // lineHeight: "100%",
              letterSpacing: "0.016em",
              textTransform: "capitalize",
              textAlign: "left",
              paddingLeft: "24px",
            }}
          >
            questions
          </p>
          <p
            style={{
              width: "calc(50% - 100px)",
              color: "#F4F4F4",
              fontWeight: 400,
              fontSize: "clamp(16px, 1.8vw, 22px)",
              lineHeight: "100%",
              letterSpacing: "0.016em",
              textTransform: "capitalize",
              textAlign: "left",
              marginLeft: "25%",
              paddingLeft: "16px",
            }}
          >
            answers
          </p>
          <p
            className="text-center"
            style={{
              width: "100px",
              color: "#F4F4F4",
              fontWeight: 400,
              fontSize: "clamp(16px, 1.8vw, 22px)",
              lineHeight: "100%",
              letterSpacing: "0.016em",
              textTransform: "capitalize",
            }}
          >
            score
          </p>
        </div>
      </header>

      <main className="test-main audit-content-padding pt-3 bg-white flex-1 overflow-y-auto min-h-0 flex flex-col">
        <div className="flex-1 flex flex-col">
          <div className="w-full border-b border-gray-300">
            <table
              className="w-full border-collapse border-gray-300 text-[23px]"
              style={{ tableLayout: "fixed" }}
            >
              {/* start */}
              <tbody>
                {displayedQuestions.map((question, index) => {
                  const selectedOptionId = answers[question.id];
                  const selectedOption = question.options.find(
                    (opt: any) => opt.id === selectedOptionId,
                  );
                  const score = selectedOption ? selectedOption.points : 0;

                  return (
                    <tr
                      key={question.id}
                      className="border-b  border-[#E8E8E8]"
                    >
                      <td
                        className="border-r border-gray-300 text-center align-middle"
                        style={{ width: "40px" }}
                      >
                        <span
                          className="text-[#212121]"
                          style={{
                            fontWeight: 400,
                            fontSize: "clamp(14px, 1.5vw, 21px)",
                            lineHeight: "100%",
                            letterSpacing: "-0.025em",
                            fontVariationSettings: "'wdth' 85, 'wght' 400",
                          }}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td
                        className="px-4 align-middle border-r  border-[#E8E8E8]"
                        style={{ width: "65%" }}
                      >
                        <div className="w-full border-[#E8E8E8] rounded-xl flex items-center">
                          <span
                            className="text-[#212121]"
                            style={{
                              fontWeight: 400,
                              fontStyle: "normal",
                              fontSize: "clamp(16px, 1.6vw, 23px)",
                              lineHeight: "100%",
                              letterSpacing: "-0.025em",
                              fontVariationSettings: "'wdth' 85, 'wght' 400",
                            }}
                          >
                            {question.text}
                          </span>
                        </div>
                      </td>
                      <td
                        className="border-r border-gray-300 px-4 align-middle"
                        style={{ width: "35%" }}
                      >
                        <div className="py-2" data-question-id={question.id}>
                          <Select
                            value={selectedOptionId || undefined}
                            onValueChange={(value) =>
                              handleAnswerChange(question.id, value)
                            }
                          >
                            {/* 🔹 Trigger */}
                            <SelectTrigger
                              className="
    relative w-full bg-[#E8E8E8] text-[#212121] border-none rounded-md px-3 pr-10
    outline-none ring-0
    focus:outline-none focus:ring-0 focus:border-transparent
    focus-visible:outline-none focus-visible:ring-0 focus-visible:border-transparent
    data-[state=open]:ring-0 data-[state=open]:outline-none data-[state=open]:border-transparent
    [&>svg]:hidden
  "
                              style={{
                                fontSize: "clamp(14px, 1.5vw, 20px)",
                                lineHeight: "100%",
                                letterSpacing: "-0.015em",
                                fontVariationSettings: "'wdth' 85, 'wght' 500",
                                textAlign: "left",
                              }}
                              data-question-id={question.id}
                            >
                              <SelectValue
                                placeholder=""
                                className="text-[#212121]"
                              />

                              {/* 🔹 Right Color + Arrow */}
                              <div
                                className="absolute right-0 top-0 h-full w-11 flex items-center justify-center rounded-md pointer-events-none"
                                style={{
                                  backgroundColor: selectedOption
                                    ? getOptionColor(selectedOption.points)
                                    : "transparent",
                                }}
                              >
                                <svg
                                  className="w-4 h-[9px]"
                                  style={{
                                    color: selectedOption ? "white" : "#606060",
                                  }}
                                  fill="currentColor"
                                  viewBox="0 0 12 8"
                                >
                                  <path d="M6 8L0 0h12L6 8z" />
                                </svg>
                              </div>
                            </SelectTrigger>

                            {/* 🔹 Dropdown */}
                            <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md">
                              {[...question.options]
                                .sort((a, b) => a.points - b.points)
                                .map((option: any) => (
                                  <SelectItem
                                    key={option.id}
                                    value={option.id}
                                    className="cursor-pointer rounded-sm px-3 py-2 hover:bg-gray-100 transition-colors font-semibold"
                                    style={{
                                      fontSize: "clamp(13px, 1.5vw, 18px)",
                                      lineHeight: "100%",
                                      letterSpacing: "-0.015em",
                                      fontVariationSettings:
                                        "'wdth' 85, 'wght' 600",
                                    }}
                                  >
                                    {option.text}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                      <td
                        className="px-4 text-center align-middle"
                        style={{ width: "100px" }}
                      >
                        <span
                          className={`px-3 rounded font-medium text-gray-900`}
                          style={{
                            fontWeight: 400,
                            fontSize: "clamp(16px, 1.6vw, 23px)",
                            lineHeight: "100%",
                            letterSpacing: "-0.025em",
                            fontVariationSettings: "'wdth' 85, 'wght' 500",
                          }}
                        >
                          {score > 0 ? score : "-"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {/* Total Score Row */}
                {currentCategoryData && (
                  <tr className="border-[#E8E8E8]">
                    <td
                      className="border-r border-gray-300 px-4 text-center align-middle"
                      style={{ width: "100px" }}
                    ></td>
                    <td
                      className="px-4  align-middle border-r border-[#E8E8E8]"
                      style={{ width: "calc(70% - 100px)" }}
                    ></td>
                    <td className="border-r border-gray-300 align-middle">
                      <div className="w-full px-4 border-[#E8E8E8] rounded-xl flex items-center justify-end">
                        <span
                          className="text-gray-50 rounded-lg pt-1 px-2 font-medium text-[clamp(16px,1.8vw,23px)] mt-1"
                          style={{
                            backgroundColor: primaryColor,
                            fontVariationSettings: "'wdth' 90, 'wght' 400",
                          }}
                        >
                          Total Score
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-4 py-2 text-center align-middle"
                      style={{ width: "100px" }}
                    >
                      <span className="px-3 py-1 text-[clamp(16px,1.8vw,22px)] rounded font-bold text-gray-900">
                        {currentCategoryScore}
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Score Interpretation Blocks */}
          {currentCategoryData && currentCategoryMaxScore > 0 && (
            <div className="relative grid grid-cols-3 gap-0 pt-4 mt-auto">
              <div className="bg-white rounded-tl-xl border-r-2 border-white">
                <div className={`rounded-tl-xl text-center pt-1 ${currentCategoryScore >= 1 && currentCategoryScore <= Math.floor(currentCategoryMaxScore * 0.4) ? "bg-[#F65355] text-white" : "bg-[#E8E8E8] text-gray-800"}`}>
                  <h3 className="text-[clamp(16px,1.8vw,23px)] font-medium" style={{ fontWeight: 500 }}>Score: 1 - {Math.floor(currentCategoryMaxScore * 0.4)}</h3>
                </div>
                <div className="mt-1">
                  <p className="text-[clamp(16px,1.6vw,22px)] px-4 text-[#212121] leading-relaxed text-center pb-3" style={{ width: "100%", color: "#212121", fontVariationSettings: "'wdth' 85, 'wght' 400" }}>Urgent attention is required. Prioritize critical gaps immediately to enhance overall performance and compliance.</p>
                </div>
              </div>

              <div className="bg-white border-r-2 border-white">
                <div className={`text-center pt-1 ${currentCategoryScore > Math.floor(currentCategoryMaxScore * 0.4) && currentCategoryScore <= Math.floor(currentCategoryMaxScore * 0.8) ? "bg-[#F7AF41] text-white" : "bg-[#E8E8E8] text-gray-800"}`}>
                  <h3 className="text-[clamp(16px,1.8vw,23px)] font-medium" style={{ fontWeight: 500 }}>Score: {Math.floor(currentCategoryMaxScore * 0.4) + 1} - {Math.floor(currentCategoryMaxScore * 0.8)}</h3>
                </div>
                <div className="mt-1 border-x border-[#E8E8E8] ">
                  <p className="text-[clamp(16px,1.6vw,22px)] px-4 text-[#212121] leading-relaxed text-center pb-3" style={{ width: "100%", color: "#212121", fontVariationSettings: "'wdth' 85, 'wght' 400" }}>This average score shows significant room for enhancement. Strengthen processes to achieve much better outcomes.</p>
                </div>
              </div>

              <div className="bg-white">
                <div className={`text-center pt-1 rounded-tr-xl ${currentCategoryScore > Math.floor(currentCategoryMaxScore * 0.8) ? "bg-[#2BD473] text-white" : "bg-[#E8E8E8] text-gray-800"}`}>
                  <h3 className="text-[clamp(16px,1.8vw,23px)] font-medium" style={{ fontWeight: 500 }}>Score: {Math.floor(currentCategoryMaxScore * 0.8) + 1} - {currentCategoryMaxScore}</h3>
                </div>
                <div className="mt-1">
                  <p className="text-[clamp(16px,1.6vw,22px)] px-4 text-[#212121] leading-relaxed text-center" style={{ width: "100%", color: "#212121", fontVariationSettings: "'wdth' 85, 'wght' 400" }}>Demonstrates excellent performance and strong compliance. Well-established processes and best practices yield outstanding results.</p>
                </div>
              </div>
            </div>
          )}

          {/* Score Progress Bar Footer (Matches Image exactly) */}
          {currentCategoryData && currentCategoryMaxScore > 0 && (
            <div className="pt-2 px-4 pb-6 bg-[#D8DEE2] mt-4 relative rounded-b-xl">
              <h3 className="mb-3 uppercase" style={{ fontWeight: 500, fontStyle: "normal", fontSize: "clamp(16px, 1.8vw, 21px)", lineHeight: "100%", letterSpacing: "-0.007em", color: "#212121", paddingTop: "4px" }}>
                {currentCategoryData.name.toUpperCase()} SCORE ({currentCategoryScore} / {currentCategoryMaxScore})
              </h3>
              <div className="relative w-full h-4 flex items-center">
                <div className="absolute inset-y-0 h-4 bg-[#2BD473] z-0 rounded-full" style={{ left: "0", width: "100%" }}></div>
                <div className="absolute inset-y-0 h-4 bg-[#F7AF41] z-10 rounded-full" style={{ left: "0", width: "66.66%" }}></div>
                <div className="absolute inset-y-0 left-0 h-4 bg-[#F65355] rounded-full z-20" style={{ width: "33.33%" }}></div>
                <div className="absolute transition-all duration-500 z-30" style={{ left: `${currentCategoryScore <= Math.floor(currentCategoryMaxScore * 0.4) ? (currentCategoryScore / Math.floor(currentCategoryMaxScore * 0.4)) * 33.33 : currentCategoryScore <= Math.floor(currentCategoryMaxScore * 0.8) ? 33.33 + ((currentCategoryScore - Math.floor(currentCategoryMaxScore * 0.4)) / (Math.floor(currentCategoryMaxScore * 0.8) - Math.floor(currentCategoryMaxScore * 0.4))) * 33.33 : 66.66 + ((currentCategoryScore - Math.floor(currentCategoryMaxScore * 0.8)) / (currentCategoryMaxScore - Math.floor(currentCategoryMaxScore * 0.8))) * 33.34}%`, top: "50%", transform: "translate(-50%, -50%)" }}>
                  <div className="z-30 h-10 bg-[#456987] rounded-[18px] flex items-center justify-center shadow-lg">
                    <span className="text-white font-medium text-[clamp(20px,2vw,28px)] pt-1 px-3">{currentCategoryScore}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
