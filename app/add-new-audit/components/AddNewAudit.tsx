/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import * as XLSX from "xlsx";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCreateAudit } from "@/lib/hooks";
import toast from "react-hot-toast";
import { CustomButton } from "@/components/common";
import SummarySection from "@/components/SummarySection";

type OptionState = { text: string; points: number };

export default function AddNewAudit() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = parseInt(searchParams.get("category") || "1", 10);
  const createAuditMutation = useCreateAudit();

  const [title, setTitle] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categoryIcon, setCategoryIcon] = useState<string>("");
  const [tableQuestions, setTableQuestions] = useState<
    { index: number; text: string }[]
  >([]);
  const [statusMap, setStatusMap] = useState<Record<number, string[]>>({});
  const [sessionStorageCategories, setSessionStorageCategories] = useState<
    Array<{ id: string; name: string; recommendation?: string }>
  >([]);

  // Load categories from sessionStorage
  const loadCategoriesFromStorage = () => {
    if (typeof window === "undefined") return;
    const auditData = sessionStorage.getItem("auditData");
    if (auditData) {
      try {
        const parsed = JSON.parse(auditData);
        if (Array.isArray(parsed.categories)) {
          const categories = parsed.categories.map(
            (
              cat: { id?: string; name?: string; recommendation?: string },
              idx: number,
            ) => ({
              id: cat.id || `temp-${idx}`,
              name: cat.name || `Category ${idx + 1}`,
              recommendation: cat.recommendation || "",
            }),
          );
          setSessionStorageCategories(categories);
        }
      } catch {}
    }
  };

  useEffect(() => {
    loadCategoriesFromStorage();
    const handleStorageChange = () => {
      loadCategoriesFromStorage();
    };
    window.addEventListener("categoryNameUpdated", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("categoryNameUpdated", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Hydrate title from sessionStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem("auditData");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.title && typeof parsed.title === "string") {
          setTitle(parsed.title);
        }
      }
    } catch {}
  }, []);

  // Hydrate category name and icon from sessionStorage on mount or category change
  useEffect(() => {
    if (typeof window === "undefined") return;
    const loadCategoryData = () => {
      try {
        // If category is 8, it's the summary
        if (currentCategory === 8) {
          setCategoryName("Summary");
          setCategoryIcon("");
          return;
        }
        // Try to get from specific category storage
        const storedName = sessionStorage.getItem(
          `auditData:categoryName:${currentCategory}`,
        );
        const storedIcon = sessionStorage.getItem(
          `auditData:categoryIcon:${currentCategory}`,
        );

        if (storedName) {
          setCategoryName(storedName);
        } else {
          // Try to get from auditData categories array
          const raw = sessionStorage.getItem("auditData");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed?.categories)) {
              const cat = parsed.categories[currentCategory - 1];
              if (cat?.name) {
                setCategoryName(cat.name);
              } else {
                setCategoryName(`Category ${currentCategory}`);
              }
            } else {
              setCategoryName(`Category ${currentCategory}`);
            }
          } else {
            setCategoryName(`Category ${currentCategory}`);
          }
        }

        // Load icon
        if (storedIcon) {
          setCategoryIcon(storedIcon);
        } else {
          // Try to get from auditData categories array
          const raw = sessionStorage.getItem("auditData");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed?.categories)) {
              const cat = parsed.categories[currentCategory - 1];
              if (cat?.icon) {
                setCategoryIcon(cat.icon);
              } else {
                setCategoryIcon("");
              }
            } else {
              setCategoryIcon("");
            }
          } else {
            setCategoryIcon("");
          }
        }
      } catch {
        setCategoryName(
          currentCategory === 8 ? "Summary" : `Category ${currentCategory}`,
        );
        setCategoryIcon("");
      }
    };

    loadCategoryData();

    // Listen for category updates from sidebar
    const handleCategoryUpdate = () => {
      loadCategoryData();
    };

    window.addEventListener("categoryNameUpdated", handleCategoryUpdate);
    return () =>
      window.removeEventListener("categoryNameUpdated", handleCategoryUpdate);
  }, [currentCategory]);

  const handleCategoryRecommendationChange = React.useCallback(
    (categoryId: string, value: string, categoryIndex: number) => {
      setSessionStorageCategories((prev) => {
        const next = [...prev];
        let targetIndex = next.findIndex((cat, idx) =>
          cat.id ? cat.id === categoryId : idx === categoryIndex - 1,
        );
        if (targetIndex === -1 && categoryIndex >= 1) {
          targetIndex = categoryIndex - 1;
        }
        while (targetIndex >= next.length && next.length < 7) {
          next.push({
            id: `temp-${next.length}`,
            name: `Category ${next.length + 1}`,
            recommendation: "",
          });
        }
        if (targetIndex >= 0 && targetIndex < next.length) {
          next[targetIndex] = {
            ...next[targetIndex],
            recommendation: value,
          };
        }
        return next;
      });

      if (typeof window !== "undefined" && categoryIndex >= 1) {
        try {
          sessionStorage.setItem(
            `auditData:categoryRecommendation:${categoryIndex}`,
            value,
          );
          const raw = sessionStorage.getItem("auditData");
          const data = raw ? JSON.parse(raw) : { categories: [] };
          if (!Array.isArray(data.categories)) data.categories = [];
          const idx = categoryIndex - 1;
          while (data.categories.length <= idx) {
            data.categories.push({
              name: `Category ${data.categories.length + 1}`,
              questions: [],
            });
          }
          data.categories[idx] = {
            ...data.categories[idx],
            recommendation: value,
          };
          sessionStorage.setItem("auditData", JSON.stringify(data));
        } catch (error) {
          console.error("Error saving category recommendation:", error);
        }
      }
    },
    [],
  );

  const buildAuditData = useMemo(() => {
    const merged: {
      title?: string;
      categories?: Array<{
        name?: string;
        icon?: string;
        questions: Array<Partial<{ text: string; options: OptionState[] }>>;
      }>;
    } = {};

    // Start from any previously saved auditData (to keep other categories intact)
    if (typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem("auditData");
        if (raw) {
          const prev = JSON.parse(raw);
          if (prev && typeof prev === "object") {
            if (typeof prev.title === "string") merged.title = prev.title;
            if (Array.isArray(prev.categories))
              merged.categories = prev.categories;
          }
        }
      } catch {}
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle) merged.title = trimmedTitle;

    // Determine if any per-row inputs exist for current category
    const hasAnyQuestion = tableQuestions.some(
      (q) => (q.text?.trim()?.length || 0) > 0,
    );
    const hasAnyStatus = Object.keys(statusMap).length > 0;

    // Build the current category questions snapshot (even if empty, we will only write if there is something)
    const questions: Array<Partial<{ text: string; options: OptionState[] }>> =
      [];
    for (let qIdx = 0; qIdx < 10; qIdx++) {
      const rowIndex = qIdx + 1;
      const qText = tableQuestions
        .find((q) => q.index === rowIndex)
        ?.text?.trim();
      const labels = statusMap[rowIndex];
      const question: Partial<{ text: string; options: OptionState[] }> = {};
      if (qText) question.text = qText;
      if (Array.isArray(labels) && labels.length === 5) {
        const defaultLabels = [
          "Very Minimal",
          "Just Starting",
          "Good progress",
          "Excellent",
          "Very Excellent",
        ];
        question.options = labels.map((t, i) => {
          return {
            text: t && t.trim() ? t.trim() : defaultLabels[i],
            points: i + 1,
          };
        });
      }
      questions.push(question);
    }

    // If current category has anything, merge it into the categories array at its index
    // IMPORTANT: Only process categories 1-7, exclude summary (category 8)
    if (
      (hasAnyQuestion || hasAnyStatus) &&
      currentCategory >= 1 &&
      currentCategory <= 7
    ) {
      const idx = Math.max(0, currentCategory - 1);
      const existingCategories = Array.isArray(merged.categories)
        ? [...merged.categories]
        : [];
      // Ensure array has enough length (max 7 categories)
      while (
        existingCategories.length < idx + 1 &&
        existingCategories.length < 7
      ) {
        existingCategories.push({
          name: `Category ${existingCategories.length + 1}`,
          questions: [],
        });
      }
      // Only update if index is within valid range (0-6 for categories 1-7)
      if (idx < 7) {
        const finalCategoryName =
          categoryName.trim() || `Category ${currentCategory}`;
        const finalCategoryIcon = categoryIcon.trim() || undefined;
        const previousCategory = existingCategories[idx] || {};
        existingCategories[idx] = {
          ...previousCategory,
          name: finalCategoryName,
          icon: finalCategoryIcon,
          questions,
        };
        // Ensure we don't exceed 7 categories - filter out any items at index 7 or higher
        merged.categories = existingCategories.filter(
          (cat, index) => index < 7,
        );
      }
    }

    return merged;
  }, [
    title,
    tableQuestions,
    statusMap,
    currentCategory,
    categoryName,
    categoryIcon,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      // Preserve summaryData before updating auditData
      const existingSummaryData = sessionStorage.getItem("summaryData");

      // Save category name and icon separately for sidebar access
      const finalCategoryName =
        categoryName.trim() || `Category ${currentCategory}`;
      const finalCategoryIcon = categoryIcon.trim() || "";
      sessionStorage.setItem(
        `auditData:categoryName:${currentCategory}`,
        finalCategoryName,
      );
      if (finalCategoryIcon) {
        sessionStorage.setItem(
          `auditData:categoryIcon:${currentCategory}`,
          finalCategoryIcon,
        );
      } else {
        sessionStorage.removeItem(`auditData:categoryIcon:${currentCategory}`);
      }

      const data = buildAuditData;
      sessionStorage.setItem("auditData", JSON.stringify(data));
      if (Array.isArray(data.categories)) {
        data.categories.forEach((cat, i) => {
          const categoryNumber = i + 1;
          sessionStorage.setItem(
            `auditData:category:${categoryNumber}`,
            JSON.stringify(cat),
          );
        });
      }

      // Restore summaryData if it existed (preserve it when navigating between pages)
      if (existingSummaryData) {
        sessionStorage.setItem("summaryData", existingSummaryData);
      }
    } catch (e) {
      console.error(e);
    }
  }, [buildAuditData, currentCategory, categoryName, categoryIcon]);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Presentation name is required");
      return;
    }

    const questionTexts = tableQuestions.map((q) => q.text).filter(Boolean);
    if (questionTexts.length === 0) {
      toast.error("Add at least one question in the table");
      return;
    }

    // Build full audit payload for sessionStorage
    const auditData = buildAuditData;

    try {
      // Persist to sessionStorage (whole audit and per-category)
      if (typeof window !== "undefined") {
        sessionStorage.setItem("auditData", JSON.stringify(auditData));
        if (Array.isArray(auditData.categories)) {
          auditData.categories.forEach((cat, i) => {
            const categoryNumber = i + 1;
            sessionStorage.setItem(
              `auditData:category:${categoryNumber}`,
              JSON.stringify(cat),
            );
          });
        }
      }

      // Transform auditData to match API format
      // IMPORTANT: Only include categories 1-7, exclude summary (category 8)
      // Filter by array index: index 0-6 = categories 1-7, index 7+ = category 8+ (summary) - exclude
      const allCategories = auditData.categories || [];
      const categories = allCategories
        .filter((cat, index) => index < 7) // Only include categories at index 0-6 (categories 1-7)
        .map((cat, index) => {
          // Define default icons to match Sidebar logic
          const defaultIcons = [
            "Folder",
            "FileText",
            "List",
            "CheckSquare",
            "PieChart",
            "BarChart",
            "Settings",
          ];
          const defaultIconName = defaultIcons[index % defaultIcons.length];

          // Filter out empty questions and ensure each question has 5 options
          const questions = cat.questions
            .filter((q) => q.text && q.text.trim().length > 0)
            .map((q) => ({
              text: q.text!.trim(),
              options:
                Array.isArray(q.options) && q.options.length === 5
                  ? q.options.map((opt) => ({
                      text: opt.text.trim(),
                      points: opt.points,
                    }))
                  : [
                      "Very Minimal",
                      "Just Starting",
                      "Good progress",
                      "Excellent",
                      "Very Excellent",
                    ].map((text, i) => ({
                      text: text,
                      points: i + 1,
                    })),
            }))
            .filter((q) => q.text.length > 0);

          return {
            name: cat.name || "Category",
            icon:
              cat.icon && cat.icon.trim() ? cat.icon.trim() : defaultIconName,
            questions,
          };
        })
        .filter((cat) => cat.questions.length > 0);

      if (categories.length === 0) {
        toast.error("Add at least one question in the table");
        return;
      }

      // Get summary data from sessionStorage if it exists
      let summaryData = null;
      if (typeof window !== "undefined") {
        const summaryDataStr = sessionStorage.getItem("summaryData");

        if (!summaryDataStr) {
          toast.error("Please fill the summary section first");
          return;
        }

        try {
          const parsed = JSON.parse(summaryDataStr);

          if (!parsed.overallDetails || !parsed.overallDetails.trim()) {
            toast.error("Please fill the overall summary details");
            return;
          }

          // Check for category recommendations
          const recMap = new Map();
          if (Array.isArray(parsed.categoryRecommendations)) {
            parsed.categoryRecommendations.forEach((r: any) =>
              recMap.set(r.categoryId, r.recommendation),
            );
          }

          // Filter active categories (same logic as 'categories' variable but keeping IDs)
          const activeCategoriesWithIds = allCategories
            .map((cat, index) => ({ ...cat, originalIndex: index })) // Keep original index for temp ID generation
            .filter((cat, index) => index < 7)
            .filter((cat) =>
              cat.questions.some((q) => q.text && q.text.trim().length > 0),
            );

          const missingRecs = activeCategoriesWithIds.some((cat) => {
            const id = (cat as any).id || `temp-${cat.originalIndex}`;
            const rec = recMap.get(id);
            return !rec || !rec.trim();
          });

          if (missingRecs) {
            toast.error(
              "Please fill the summary recommendations for all categories",
            );
            return;
          }

          // Map temp category IDs to category indices (will be mapped to real IDs after creation)
          // For now, we'll use the category index as the identifier
          summaryData = {
            categoryRecommendations: parsed.categoryRecommendations || [],
            nextSteps: parsed.nextSteps || [],
            overallDetails: parsed.overallDetails,
          };
        } catch (error) {
          console.error("Error parsing summary data:", error);
          toast.error("Failed to process summary data");
          return;
        }
      }

      // Call single audit API with full data
      // IMPORTANT: Summary is sent as a separate field, NOT as part of categories array
      // Categories array only contains categories 1-7, summary is completely separate

      console.log("Categories array only contains categories 1-7,", {
        title: (auditData.title || title).trim(),
        categories, // Only categories 1-7, excludes summary
        ...(summaryData && { summary: summaryData }), // Summary is separate from categories
      });
      const createdAudit = await createAuditMutation.mutateAsync({
        title: (auditData.title || title).trim(),
        categories, // Only categories 1-7, excludes summary
        ...(summaryData && { summary: summaryData }), // Summary is separate from categories
      });

      toast.success("Audit created successfully");

      // Store the created audit ID in sessionStorage before clearing
      if (typeof window !== "undefined" && createdAudit?.id) {
        sessionStorage.setItem("createdAuditId", createdAudit.id);

        // Map temp category IDs to real category IDs and update summary if needed
        if (summaryData && createdAudit.categories) {
          try {
            const categoryMap: Record<string, string> = {};
            createdAudit.categories.forEach((cat, idx) => {
              categoryMap[`temp-${idx}`] = cat.id;
            });

            // Clear summary data from sessionStorage
            sessionStorage.removeItem("summaryData");
          } catch (error) {
            console.error("Error updating summary with category IDs:", error);
            // Don't fail the audit creation if summary update fails
            sessionStorage.removeItem("summaryData");
          }
        } else if (summaryData) {
          // Clear summary data from sessionStorage even if update fails
          sessionStorage.removeItem("summaryData");
        }
      }

      // Clear all state
      setTitle("");
      setCategoryName("");
      setCategoryIcon("");
      setTableQuestions([]);
      setStatusMap({});

      // Clear full sessionStorage after successful creation
      if (typeof window !== "undefined") {
        sessionStorage.clear();

        // Dispatch  to update sidebar
        window.dispatchEvent(new Event("categoryNameUpdated"));
      }
      // Redirect to home page after successful creation
      router.push("/");
    } catch (e) {
      toast.error("Failed to create audit. Please try again.");
      console.error(e);
    }
  };

  const convertToFormat = (rows: any) => {
    const title =
      rows.find((r: any) => r["Presentation Name"])?.["Presentation Name"] ||
      "Untitled";

    let currentCategory = "";

    const categoriesMap: Record<string, any[]> = {};

    rows.forEach((row: any) => {
      if (row["Category"]) {
        currentCategory = row["Category"];
      }

      if (!categoriesMap[currentCategory]) {
        categoriesMap[currentCategory] = [];
      }

      const questionText = row["Question 2"];
      if (!questionText) return;

      const optionsRaw = String(row["Column 2"] || "").split(",");

      const options = optionsRaw.map((opt, index) => ({
        text: opt.trim(),
        points: index + 1,
      }));

      categoriesMap[currentCategory].push({
        text: questionText,
        options,
      });
    });

    return {
      title,
      categories: Object.keys(categoriesMap).map((name) => ({
        name,
        questions: categoriesMap[name],
      })),
    };
  };

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (event) => {
      if (!event.target) return;
      const data = event.target.result;

      const workbook = XLSX.read(data, { type: "binary" });

      const sheetName = workbook.SheetNames[0];

      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      const formattedData = convertToFormat(rows);

      console.log("Converted JSON:", formattedData);

      // 👉 Save it to state or send directly
      const createdAudit = await createAuditMutation.mutateAsync(formattedData);
      toast.success("Audit created successfully");

      // Clear full sessionStorage after successful creation
      if (typeof window !== "undefined") {
        sessionStorage.clear();

        // Dispatch event to update sidebar
        window.dispatchEvent(new Event("categoryNameUpdated"));
      }
      // Redirect to home page after successful creation
      router.push("/");
    };

    reader.readAsBinaryString(file);
  };
  return (
    <div className="">
      <header className="">
        <div className="bg-white pt-5 flex items-center justify-center gap-2.5 w-full ">
          <p className=" text-[14px] 2xl:text-[17px] uppercase font-500 tracking-[0.352px] leading-normal font-medium pl-4 xl:pl-0 text-nowrap">
            GRADING SCALE (1-5)
          </p>
          <div className="flex xl:grid grid-cols-3 gap-[1.89px]">
            <p className="w-full text-[14px] xl:text-[17px] uppercase font-medium bg-[#F65355] px-5 xl:px-[38px] py-2.5 text-white rounded-tl-xl text-nowrap">
              1-2 URGENT ATTENTION
            </p>
            <p className="w-full text-[14px] xl:text-[17px] uppercase font-medium bg-[#F7AF41] px-5 xl:px-[38px] py-2.5 text-white text-nowrap">
              3-4 AVERAGE AUDIT
            </p>
            <p className="w-full text-[14px] xl:text-[17px] uppercase font-medium bg-[#209150] px-5 xl:px-[38px] py-2.5 text-white rounded-tr-xl text-nowrap">
              5 EXCELLENT AUDIT
            </p>
          </div>
        </div>

        <div
          className="audit-content-padding flex items-center"
          style={{ width: "100%" }}
        >
          <p className="audit-index-col text-[22px] text-white capitalize font-500 tracking-[0.352px] leading-normal font-medium"></p>
          <p className="audit-question-col text-[22px] text-white capitalize font-500 tracking-[0.352px] leading-normal font-medium text-center">
            questions
          </p>
          <p className="audit-answer-col text-[22px] text-white capitalize font-500 tracking-[0.352px] leading-normal font-medium text-center">
            answers
          </p>
          {/* <p className="audit-answer-col text-[22px] text-white capitalize font-500 tracking-[0.352px] leading-normal font-medium text-center">
            score
          </p> */}
        </div>
      </header>

      <main className="audit-content-padding pt-5 bg-white overflow-y-auto">
        <div className="flex gap items-center justify-between mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Presentation Name"
              className="w-full bg-[#4569871A] px-5 py-[11px] border border-[#3b5163] rounded-xl outline-none"
              style={{
                fontFamily: "var(--font-acumin)",
                fontWeight: 400,
                fontSize: "clamp(20px, 1.8vw, 23px)",
                letterSpacing: "-0.025em",
                lineHeight: "1",
                fontVariationSettings: "'wdth' 85, 'wght' 400",
              }}
            />
          </div>
          <div className="w-px h-9 bg-[#3b5163] mx-3 xl:mx-7"></div>
          <div className="flex-1 xl:w-1/3 flex gap-2 xl:gap-3">
            <button
              onClick={() => router.push("/")}
              className="px-2 xl:px-5 py-3 bg-[#CECECE] hover:bg-[#CECECE]/80 transition-all duration-300 rounded-full text-[14px] xl:text-[18px] tracking-[0.352px] leading-normal cursor-pointer flex-1"
            >
              Back to List
            </button>
            <CustomButton
              variant="primary"
              size="md"
              className="flex-1 px-2 xl:px-5 py-3 text-[14px] xl:text-[18px]"
              fullRounded={true}
              disabled={createAuditMutation.isPending}
              onClick={handleCreate}
            >
              {createAuditMutation.isPending ? "Creating..." : "Create Audit"}
            </CustomButton>
            <div className="flex items-center justify-center px-2 xl:px-5 py-3 bg-[#CECECE] hover:bg-[#CECECE]/80 transition-all duration-300 rounded-full text-[14px] xl:text-[18px] tracking-[0.352px] leading-normal cursor-pointer flex-1">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="auditUpload"
              />

              <label htmlFor="auditUpload">Upload File</label>
            </div>
          </div>
        </div>

        {currentCategory === 8 ? (
          <SummarySection
            editId={null}
            isCreateMode={true}
            sessionStorageCategories={sessionStorageCategories}
            onRecommendationChange={handleCategoryRecommendationChange}
          />
        ) : (
          <div className="mb-8">
            <AuditTable
              currentCategory={currentCategory}
              onQuestionsChange={setTableQuestions}
              onStatusChange={(rowIndex, labels) =>
                setStatusMap((prev) => ({ ...prev, [rowIndex]: labels }))
              }
            />
          </div>
        )}
      </main>
    </div>
  );
}

interface AuditTableProps {
  currentCategory: number;
  onQuestionsChange?: (questions: { index: number; text: string }[]) => void;
  onStatusChange?: (rowIndex: number, labels: string[]) => void;
}

function AuditTable({
  currentCategory,
  onQuestionsChange,
  onStatusChange,
}: AuditTableProps) {
  const [activeRows, setActiveRows] = useState<Set<number>>(new Set());
  const [questions, setQuestions] = useState<{ [key: number]: string }>({});
  const [statusLabels, setStatusLabels] = useState<Record<number, string[]>>(
    {},
  );
  const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null);
  const [dragOverRowIndex, setDragOverRowIndex] = useState<number | null>(null);

  // Hydrate questions and status labels from sessionStorage on mount or category change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      // Questions per row 1..10 for current category
      const qInit: { [key: number]: string } = {};
      for (let i = 1; i <= 10; i++) {
        const qs = sessionStorage.getItem(
          `auditData:question:${currentCategory}:${i}`,
        );
        if (qs && typeof qs === "string" && qs.length > 0) {
          qInit[i] = qs;
        }
      }

      // If not present, try from auditData (specific category)
      if (Object.keys(qInit).length === 0) {
        const categoryData = sessionStorage.getItem(
          `auditData:category:${currentCategory}`,
        );
        if (categoryData) {
          const parsed = JSON.parse(categoryData);
          if (parsed?.questions?.length) {
            parsed.questions.forEach((q: { text?: string }, idx: number) => {
              const rowIndex = idx + 1;
              if (q?.text) qInit[rowIndex] = String(q.text);
            });
          }
        }
      }

      setQuestions(qInit);

      // Status labels (options) per row 1..10 for current category
      const statusInit: Record<number, string[]> = {};
      for (let i = 1; i <= 10; i++) {
        const st = sessionStorage.getItem(
          `auditData:status:${currentCategory}:${i}`,
        );
        if (st) {
          const arr = JSON.parse(st) as unknown;
          if (Array.isArray(arr) && arr.length)
            statusInit[i] = (arr as unknown[]).map((v) => String(v));
        }
      }

      // If not present, try from auditData options of specific category
      if (Object.keys(statusInit).length === 0) {
        const categoryData = sessionStorage.getItem(
          `auditData:category:${currentCategory}`,
        );
        if (categoryData) {
          const parsed = JSON.parse(categoryData);
          if (parsed?.questions?.length) {
            parsed.questions.forEach(
              (q: { options?: { text?: string }[] }, idx: number) => {
                const rowIndex = idx + 1;
                if (Array.isArray(q?.options) && q.options.length) {
                  statusInit[rowIndex] = q.options.map((o: { text?: string }) =>
                    String(o?.text ?? ""),
                  );
                }
              },
            );
          }
        }
      }

      setStatusLabels(statusInit);

      // Auto-activate rows that have restored content (question or status)
      const rowsToActivate = new Set<number>();
      for (let i = 1; i <= 10; i++) {
        const hasQ = typeof qInit[i] === "string" && qInit[i].trim().length > 0;
        const hasS = Array.isArray(statusInit[i]) && statusInit[i].length > 0;
        if (hasQ || hasS) rowsToActivate.add(i);
      }
      setActiveRows(rowsToActivate);
    } catch {}
  }, [currentCategory]);

  useEffect(() => {
    if (!onQuestionsChange) return;
    const list = Object.keys(questions)
      .map((k) => ({
        index: Number(k),
        text: questions[Number(k)]?.trim?.() || "",
      }))
      .filter((q) => q.text.length > 0)
      .sort((a, b) => a.index - b.index);
    onQuestionsChange(list);
  }, [questions, onQuestionsChange]);

  const handleQuestionClick = (rowIndex: number) => {
    setActiveRows((prev) => {
      const newSet = new Set(prev);
      newSet.add(rowIndex);
      return newSet;
    });
  };

  const getStatusValue = (rowIndex: number, idx: number) => {
    const row = statusLabels[rowIndex];
    if (row && row[idx] !== undefined) return row[idx];
    return statusButtons[idx].label;
  };

  const setStatusValue = (rowIndex: number, idx: number, value: string) => {
    setStatusLabels((prev) => {
      const next = { ...prev };
      const row = next[rowIndex]
        ? [...next[rowIndex]]
        : statusButtons.map((s) => s.label);
      row[idx] = value;
      next[rowIndex] = row;

      // Save to sessionStorage and notify parent with the updated value
      try {
        if (typeof window !== "undefined") {
          const key = `auditData:status:${currentCategory}:${rowIndex}`;
          sessionStorage.setItem(key, JSON.stringify(row));
          onStatusChange?.(rowIndex, row);
        }
      } catch {}

      return next;
    });
  };

  const handleQuestionChange = (rowIndex: number, value: string) => {
    setQuestions((prev) => ({
      ...prev,
      [rowIndex]: value,
    }));
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          `auditData:question:${currentCategory}:${rowIndex}`,
          value,
        );
      }
    } catch {}

    // Auto-add options for this question if not present yet, using current status labels (defaults)
    if (!statusLabels[rowIndex] || statusLabels[rowIndex].length !== 5) {
      const defaults = statusButtons.map((s) => s.label);
      setStatusLabels((prev) => ({ ...prev, [rowIndex]: defaults }));
      try {
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            `auditData:status:${currentCategory}:${rowIndex}`,
            JSON.stringify(defaults),
          );
        }
      } catch {}
      onStatusChange?.(rowIndex, defaults);
    }
  };

  // Handle row drag and drop
  const handleRowDragStart = (e: React.DragEvent, rowIndex: number) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.closest("input")) {
      e.preventDefault();
      return;
    }
    setDraggedRowIndex(rowIndex);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", rowIndex.toString());
  };

  const handleRowDragOver = (e: React.DragEvent, rowIndex: number) => {
    if (draggedRowIndex === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (rowIndex !== draggedRowIndex) {
      setDragOverRowIndex(rowIndex);
    }
  };

  const handleRowDragLeave = () => {
    setDragOverRowIndex(null);
  };

  const handleRowDrop = (e: React.DragEvent, targetRowIndex: number) => {
    if (draggedRowIndex === null || draggedRowIndex === targetRowIndex) {
      setDraggedRowIndex(null);
      setDragOverRowIndex(null);
      return;
    }
    e.preventDefault();

    // Create an array for the 10 rows to perform splice reordering
    const rowRange = Array.from({ length: 10 }, (_, i) => i + 1);

    // Map current state to an array of objects
    const items = rowRange.map((idx) => ({
      question: questions[idx] || "",
      status: statusLabels[idx] || null,
    }));

    // Perform splice
    const [draggedItem] = items.splice(draggedRowIndex - 1, 1);
    items.splice(targetRowIndex - 1, 0, draggedItem);

    // Map back to dictionary state, but indices are 1..10
    const newQuestions: { [key: number]: string } = {};
    const newStatusLabels: Record<number, string[]> = {};

    items.forEach((item, idx) => {
      const newIdx = idx + 1;
      if (item.question) newQuestions[newIdx] = item.question;
      if (item.status) newStatusLabels[newIdx] = item.status;

      // Update sessionStorage
      try {
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            `auditData:question:${currentCategory}:${newIdx}`,
            item.question || "",
          );
          if (item.status) {
            sessionStorage.setItem(
              `auditData:status:${currentCategory}:${newIdx}`,
              JSON.stringify(item.status),
            );
          } else {
            sessionStorage.removeItem(
              `auditData:status:${currentCategory}:${newIdx}`,
            );
          }
        }
      } catch {}
    });

    setQuestions(newQuestions);
    setStatusLabels(newStatusLabels);

    setDraggedRowIndex(null);
    setDragOverRowIndex(null);
  };

  const statusButtons = [
    {
      label: "Very Minimal",
      color: "bg-[#FFE2E380]",
      borderColor: "border-[#FFB7B9]",
      textColor: "#A51A1F",
    },
    {
      label: "Just Starting",
      color: "bg-[#FFFCE280]",
      borderColor: "border-[#E3D668]",
      textColor: "#776E23",
    },
    {
      label: "Good progress",
      color: "bg-[#FFDBC2B2]",
      borderColor: "border-[#894B00E5]",
      textColor: "#894B00",
    },
    {
      label: "Excellent",
      color: "bg-[#DCFCE7]",
      borderColor: "border-[#01673099]",
      textColor: "#016730",
    },
    {
      label: "Very Excellent",
      color: "bg-[#DCF3F6]",
      borderColor: "border-[#01673099]",
      textColor: "text-blue-800",
    },
  ];

  return (
    <div className="w-full mt-8 overflow-x-auto">
      <table
        className="w-full border-collapse border border-gray-300"
        style={{ tableLayout: "fixed" }}
      >
        <tbody>
          {Array.from({ length: 10 }, (_, index) => {
            const rowIndex = index + 1;
            const isActive = activeRows.has(rowIndex);

            return (
              <tr
                key={rowIndex}
                draggable={true}
                onDragStart={(e) => handleRowDragStart(e, rowIndex)}
                onDragOver={(e) => handleRowDragOver(e, rowIndex)}
                onDragLeave={handleRowDragLeave}
                onDrop={(e) => handleRowDrop(e, rowIndex)}
                className={`border-b border-gray-300  ${dragOverRowIndex === rowIndex ? "border-t-4 border-t-blue-500" : ""} cursor-move`}
              >
                <td className="audit-index-col border-r border-gray-300 px-4 py-3 text-center align-middle">
                  <div className="flex items-center justify-center gap-2 text-black">
                    <span className="select-none cursor-grab active:cursor-grabbing">
                      =
                    </span>
                    <span className="font-medium text-base xl:text-lg">
                      {rowIndex}
                    </span>
                  </div>
                </td>
                <td className="audit-question-col border-r border-gray-300 px-4 py-[10px] align-middle">
                  <input
                    type="text"
                    maxLength={66}
                    value={questions[rowIndex] || ""}
                    placeholder={`Question ${rowIndex.toString().padStart(2, "0")}`}
                    onClick={() => handleQuestionClick(rowIndex)}
                    onChange={(e) =>
                      handleQuestionChange(rowIndex, e.target.value)
                    }
                    className="w-full bg-[#4569871A] px-2 sm:px-3 lg:px-4 py-[10.5px] sm:py-[10px] lg:py-[12px] xl:py-[14px] border border-[#3b5163] rounded-xl outline-none"
                    style={{
                      fontFamily: "var(--font-acumin)",
                      fontWeight: 400,
                      fontSize: "23px",
                      lineHeight: "100%",
                      letterSpacing: "-0.025em",
                      fontVariationSettings: "'wdth' 85, 'wght' 400",
                    }}
                  />
                </td>
                <td className="audit-answer-col px-1 sm:px-1.5 lg:px-2 lg:py-3 sm:py-2 py-1.5 align-middle">
                  {isActive ? (
                    <div className="flex gap-1 xl:gap-2 items-center justify-center">
                      {statusButtons.map((button, idx) => (
                        <input
                          key={button.label}
                          type="text"
                          value={getStatusValue(rowIndex, idx)}
                          onChange={(e) =>
                            setStatusValue(rowIndex, idx, e.target.value)
                          }
                          className={`audit-status-button ${button.color} ${button.borderColor} ${!button.textColor.startsWith("#") ? button.textColor : ""} rounded-xl border outline-none opacity-55 text-[10px] sm:text-[16px] lg:text-[18px] xl:text-[21px] px-1.5 xl:px-4 min-w-[50px] py-2 xl:py-[13px] font-normal`}
                          style={{
                            fontFamily: "var(--font-acumin)",
                            fontWeight: 400,
                            // fontSize: "18px",
                            lineHeight: "100%",
                            letterSpacing: "-0.015em",
                            // fontVariationSettings: "'wdth' 55, 'wght' 700",
                            // paddingTop: "12px",
                            // paddingBottom: "12px",
                            textAlign: "center",
                            color: button.textColor.startsWith("#")
                              ? button.textColor
                              : undefined,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="w-[30vw]"></div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
