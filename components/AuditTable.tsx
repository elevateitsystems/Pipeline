"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { FiEdit } from "react-icons/fi";

type OptionState = { id?: string; text: string; points: number };
type CategoryFormData = {
  id?: string;
  name: string;
  icon?: string;
  recommendation?: string;
  questions: Array<{
    id?: string;
    text: string;
    options: OptionState[];
  }>;
};

interface AuditTableProps {
  currentCategory: number;
  categoryData: CategoryFormData;
  onCategoryNameChange: (name: string) => void;
  onCategoryIconChange: (icon: string) => void;
  onQuestionChange: (rowIndex: number, text: string) => void;
  onOptionChange: (rowIndex: number, optionIndex: number, text: string) => void;
  onQuestionsReorder: (draggedRowIndex: number, targetRowIndex: number) => void;
}

const AuditTable = React.memo(function AuditTable({
  currentCategory,
  categoryData,
  onQuestionChange,
  onOptionChange,
  onQuestionsReorder,
}: AuditTableProps) {
  const [activeRows, setActiveRows] = useState<Set<number>>(new Set());
  const [editableQuestions, setEditableQuestions] = useState<Set<number>>(
    new Set(),
  );
  const [editableStatus, setEditableStatus] = useState<
    Record<number, Set<number>>
  >({});
  const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null);
  const [dragOverRowIndex, setDragOverRowIndex] = useState<number | null>(null);

  // Initialize active rows based on category data
  useEffect(() => {
    const rowsToActivate = new Set<number>();
    categoryData.questions.forEach((q, idx) => {
      const rowIndex = idx + 1;
      if (q.text && q.text.trim().length > 0) {
        rowsToActivate.add(rowIndex);
      }
    });
    setActiveRows(rowsToActivate);
  }, [categoryData, currentCategory]);

  const handleQuestionClick = useCallback((rowIndex: number) => {
    setActiveRows((prev) => {
      const newSet = new Set(prev);
      newSet.add(rowIndex);
      return newSet;
    });
  }, []);

  const getQuestionText = useCallback(
    (rowIndex: number): string => {
      const question = categoryData.questions[rowIndex - 1];
      return question?.text || "";
    },
    [categoryData.questions],
  );

  const getOptionText = useCallback(
    (rowIndex: number, optionIndex: number): string => {
      const question = categoryData.questions[rowIndex - 1];
      if (question && question.options && question.options[optionIndex]) {
        return question.options[optionIndex].text;
      }
      const statusButtonsLabels = [
        "Very Minimal",
        "Just Starting",
        "Good progress",
        "Excellent",
        "Very Excellent",
      ];
      return statusButtonsLabels[optionIndex] || "";
    },
    [categoryData.questions],
  );

  const handleQuestionChange = useCallback(
    (rowIndex: number, value: string) => {
      onQuestionChange(rowIndex, value);
    },
    [onQuestionChange],
  );

  const handleOptionChange = useCallback(
    (rowIndex: number, optionIndex: number, value: string) => {
      onOptionChange(rowIndex, optionIndex, value);
    },
    [onOptionChange],
  );

  const statusButtons = useMemo(
    () => [
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
    ],
    [],
  );

  const handleRowDragStart = useCallback(
    (e: React.DragEvent, rowIndex: number) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.closest("input")) {
        e.preventDefault();
        return;
      }
      setDraggedRowIndex(rowIndex);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", rowIndex.toString());
    },
    [],
  );

  const handleRowDragOver = useCallback(
    (e: React.DragEvent, rowIndex: number) => {
      if (draggedRowIndex === null) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (rowIndex !== draggedRowIndex) {
        setDragOverRowIndex(rowIndex);
      }
    },
    [draggedRowIndex],
  );

  const handleRowDragLeave = useCallback(() => {
    setDragOverRowIndex(null);
  }, []);

  const handleRowDrop = useCallback(
    (e: React.DragEvent, targetRowIndex: number) => {
      if (draggedRowIndex === null || draggedRowIndex === targetRowIndex) {
        setDraggedRowIndex(null);
        setDragOverRowIndex(null);
        return;
      }
      e.preventDefault();
      onQuestionsReorder(draggedRowIndex, targetRowIndex);
      setDraggedRowIndex(null);
      setDragOverRowIndex(null);
    },
    [draggedRowIndex, onQuestionsReorder],
  );

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
            const isDragging = draggedRowIndex === rowIndex;
            const isDragOver = dragOverRowIndex === rowIndex;

            return (
              <tr
                key={rowIndex}
                draggable={true}
                onDragStart={(e) => handleRowDragStart(e, rowIndex)}
                onDragOver={(e) => handleRowDragOver(e, rowIndex)}
                onDragLeave={handleRowDragLeave}
                onDrop={(e) => handleRowDrop(e, rowIndex)}
                className={`border-b border-gray-300 ${isDragging ? "opacity-50" : ""} ${isDragOver ? "border-t-4 border-t-blue-500" : ""} cursor-move`}
              >
                <td className="audit-index-col border-r border-gray-300 px-4 py-3 text-center align-middle">
                  <div className="flex items-center justify-center gap-2 text-black">
                    <span className="select-none cursor-grab active:cursor-grabbing">
                      =
                    </span>
                    <span className="font-medium text-lg">{rowIndex}</span>
                  </div>
                </td>
                <td className="audit-question-col border-r border-gray-300 px-4 py-[10px] align-middle">
                  <div className="relative">
                    <input
                      type="text"
                      value={getQuestionText(rowIndex)}
                      placeholder={`Question ${rowIndex.toString().padStart(2, "0")}`}
                      onClick={() => handleQuestionClick(rowIndex)}
                      onChange={(e) =>
                        handleQuestionChange(rowIndex, e.target.value)
                      }
                      disabled={!editableQuestions.has(rowIndex)}
                      className="w-full bg-[#4569871A] px-2 sm:px-3 lg:px-4 py-[10.5px] sm:py-[10px] lg:py-[12px] xl:py-[14px] border border-[#3b5163] rounded-xl outline-none disabled:opacity-70"
                      style={{
                        fontFamily: "var(--font-acumin), sans-serif",
                        fontWeight: 400,
                        fontSize: "23px",
                        lineHeight: "100%",
                        letterSpacing: "-0.025em",
                        fontVariationSettings: "'wdth' 85, 'wght' 400",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditableQuestions((prev) => {
                          const next = new Set(Array.from(prev));
                          if (next.has(rowIndex)) next.delete(rowIndex);
                          else next.add(rowIndex);
                          return next;
                        })
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-700 hover:bg-gray-50 rounded cursor-pointer"
                      aria-label={
                        editableQuestions.has(rowIndex)
                          ? "Disable editing question"
                          : "Enable editing question"
                      }
                    >
                      <FiEdit size={12} />
                    </button>
                  </div>
                </td>
                <td className="audit-answer-col px-1 sm:px-1.5 lg:px-2 lg:py-3 sm:py-2 py-1.5 align-middle">
                  {isActive ? (
                    <div className="flex gap-0.5 sm:gap-1 lg:gap-4 items-center justify-center">
                      {statusButtons.map((button, idx) => (
                        <div
                          key={button.label}
                          className={`flex items-center gap-2 justify-center audit-status-button rounded-xl border text-[10px] sm:text-[16px] lg:text-[18px] xl:text-[21px] px-1 lg:px-2 xl:px-4 py-1.5 sm:py-[8px] lg:py-[12px] xl:py-[13px] ${button.color} ${button.borderColor} ${!button.textColor.startsWith("#") ? button.textColor : ""} font-normal disabled:opacity-40`}
                        >
                          <input
                            className="w-[50px] sm:w-[60px] md:w-[180px] lg:w-[125px] xl:w-[110px]"
                            type="text"
                            value={getOptionText(rowIndex, idx)}
                            onChange={(e) =>
                              handleOptionChange(rowIndex, idx, e.target.value)
                            }
                            disabled={
                              !(editableStatus[rowIndex]?.has(idx) ?? false)
                            }
                            style={{
                              fontFamily: "var(--font-acumin), sans-serif",
                              fontWeight: 400,
                              lineHeight: "100%",
                              letterSpacing: "-0.015em",
                              textAlign: "center",
                              color: button.textColor.startsWith("#")
                                ? button.textColor
                                : undefined,
                            }}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setEditableStatus((prev) => {
                                const next: Record<number, Set<number>> = {
                                  ...prev,
                                } as Record<number, Set<number>>;
                                const existing = next[rowIndex]
                                  ? new Set(Array.from(next[rowIndex]))
                                  : new Set<number>();
                                if (existing.has(idx)) {
                                  existing.delete(idx);
                                } else {
                                  existing.add(idx);
                                }
                                next[rowIndex] = existing;
                                return next;
                              })
                            }
                            className={`hover:opacity-80 rounded cursor-pointer`}
                            style={{
                              color: button.textColor.startsWith("#")
                                ? button.textColor
                                : undefined,
                            }}
                            aria-label={
                              (editableStatus[rowIndex]?.has(idx) ?? false)
                                ? "Disable editing option"
                                : "Enable editing option"
                            }
                          >
                            <FiEdit size={10} className="size-4" />
                          </button>
                        </div>
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
});

AuditTable.displayName = "AuditTable";

export default AuditTable;
