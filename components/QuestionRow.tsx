"use client";

import React, { useState, useCallback } from "react";
import { FiEdit } from "react-icons/fi";

interface QuestionRowProps {
  rowIndex: number;
  isActive: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  questionText: string;
  onQuestionClick: (rowIndex: number) => void;
  onQuestionChange: (rowIndex: number, text: string) => void;
  onOptionChange: (rowIndex: number, optionIndex: number, text: string) => void;
  getOptionText: (rowIndex: number, optionIndex: number) => string;
  onDragStart: (e: React.DragEvent, rowIndex: number) => void;
  onDragOver: (e: React.DragEvent, rowIndex: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, rowIndex: number) => void;
  statusButtons: Array<{
    label: string;
    color: string;
    borderColor: string;
    textColor: string;
  }>;
}

const QuestionRow = React.memo(function QuestionRow({
  rowIndex,
  isActive,
  isDragging,
  isDragOver,
  questionText,
  onQuestionClick,
  onQuestionChange,
  onOptionChange,
  getOptionText,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  statusButtons,
}: QuestionRowProps) {
  const [isEditable, setIsEditable] = useState(false);
  const [editableOptions, setEditableOptions] = useState<Set<number>>(
    new Set(),
  );

  const handleEditToggle = useCallback(() => {
    setIsEditable((prev) => !prev);
  }, []);

  const handleOptionEditToggle = useCallback((idx: number) => {
    setEditableOptions((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  return (
    <tr
      draggable={true}
      onDragStart={(e) => onDragStart(e, rowIndex)}
      onDragOver={(e) => onDragOver(e, rowIndex)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, rowIndex)}
      className={`border-b border-gray-300 ${isDragging ? "opacity-50" : ""} ${isDragOver ? "border-t-4 border-t-blue-500" : ""} cursor-move`}
    >
      <td className="audit-index-col border-r border-gray-300 px-4 py-3 text-center align-middle">
        <div className="flex items-center justify-center gap-2">
          <span className="text-gray-400 select-none cursor-grab active:cursor-grabbing">
            =
          </span>
          <span className="text-gray-700">{rowIndex}</span>
        </div>
      </td>
      <td className="audit-question-col border-r border-gray-300 px-4 py-3 align-middle">
        <div className="relative">
          <input
            type="text"
            value={questionText}
            placeholder={`Question ${rowIndex.toString().padStart(2, "0")}`}
            onClick={() => onQuestionClick(rowIndex)}
            onChange={(e) => onQuestionChange(rowIndex, e.target.value)}
            disabled={!isEditable}
            className="w-full bg-[#4569871A] pr-12 pl-4 h-[60px] border border-[#3b5163] rounded-xl outline-none disabled:opacity-70"
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
            onClick={handleEditToggle}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-700 hover:bg-gray-50 rounded cursor-pointer"
            aria-label={
              isEditable
                ? "Disable editing question"
                : "Enable editing question"
            }
          >
            <FiEdit size={12} />
          </button>
        </div>
      </td>
      <td className="audit-answer-col px-2 py-3 align-middle">
        {isActive ? (
          <div className="flex gap-2 items-center justify-center">
            {statusButtons.map((button, idx) => (
              <div key={button.label} className="relative">
                <input
                  type="text"
                  value={getOptionText(rowIndex, idx)}
                  onChange={(e) =>
                    onOptionChange(rowIndex, idx, e.target.value)
                  }
                  disabled={!editableOptions.has(idx)}
                  className={`audit-status-button ${button.color} ${button.borderColor} ${!button.textColor.startsWith("#") ? button.textColor : ""}  rounded-lg border outline-none disabled:opacity-70`}
                  style={{
                    fontFamily: "var(--font-acumin), sans-serif",
                    fontWeight: 400,
                    fontSize: "18px",
                    lineHeight: "100%",
                    letterSpacing: "-0.015em",
                    fontVariationSettings: "'wdth' 55, 'wght' 700",
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    textAlign: "center",
                    color: button.textColor.startsWith("#")
                      ? button.textColor
                      : undefined,
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleOptionEditToggle(idx)}
                  className={`absolute right-1 top-1/2 -translate-y-1/2 p-0.5 ${button.textColor} hover:opacity-80 rounded cursor-pointer`}
                  aria-label={
                    editableOptions.has(idx)
                      ? "Disable editing option"
                      : "Enable editing option"
                  }
                >
                  <FiEdit size={10} />
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
});

QuestionRow.displayName = "QuestionRow";

export default QuestionRow;
