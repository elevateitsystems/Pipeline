"use client";

import React, { memo, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { FiEdit } from "react-icons/fi";
import IconPicker from "./IconPicker";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  item: {
    name: string;
    href: string;
    icon: React.ReactNode;
    categoryNumber?: number;
  };
  isActive: boolean;
  isEditing: boolean;
  isCategoryItem: boolean;
  itemCategoryNumber: number | null;
  backgroundColor: string;
  textColor: string;
  isDragging: boolean;
  isDragOver: boolean;
  canDrag: boolean;
  isSummaryItem: boolean;
  useSecondary: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onEditClick?: (e: React.MouseEvent) => void;
  onItemClick: (e: React.MouseEvent) => void;
  onMouseDownDrag?: () => void;
  onIconPickerTrigger: (e: React.MouseEvent) => void;
  onCategoryNameUpdate: (name: string) => void;
  onCategoryIconUpdate: (iconName: string) => void;
  editingIconCategory: number | null;
  setEditingIconCategory: (val: number | null) => void;
  setEditingCategory: (val: number | null) => void;
  getCategoryName: (num: number) => string;
  getCategoryIcon: (num: number) => string | undefined;
  renderIcon: (iconName: string | undefined) => React.ReactNode;
}

const SidebarItem = memo(
  ({
    item,
    isActive,
    isEditing,
    isCategoryItem,
    itemCategoryNumber,
    backgroundColor,
    textColor,
    isDragging,
    isDragOver,
    canDrag,
    isSummaryItem,
    useSecondary,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onDrop,
    onEditClick,
    onItemClick,
    onMouseDownDrag,
    onIconPickerTrigger,
    onCategoryNameUpdate,
    onCategoryIconUpdate,
    editingIconCategory,
    setEditingIconCategory,
    setEditingCategory,
    getCategoryName,
    getCategoryIcon,
    renderIcon,
  }: SidebarItemProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (isEditing && inputRef.current) {
        // focus with preventScroll to stop the browser from "jumping" to the input
        // which happens if the item is partially off-screen or overflows
        inputRef.current.focus({ preventScroll: true });
      }
    }, [isEditing]);

    return (
      <div
        draggable={canDrag && !isSummaryItem}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={onItemClick}
        className={cn(`h-[58px] cursor-pointer flex items-center relative bg-[${backgroundColor}]`,
          isActive
            ? "w-[calc(100%+2px)] mr-0 rounded-l-[10px] border-r-0"
            : (isCategoryItem || isSummaryItem) && !useSecondary
              ? "w-[calc(100%-clamp(0.75rem,2vw,1rem)+1px)] rounded-l-[10px] border-r-0"
              : "rounded-l-[10px]",
          isDragging ? "opacity-50" : "", isDragOver ? "border-2 border-dashed border-white" : "", canDrag && !isSummaryItem ? "cursor-move" : "",
          useSecondary ? 'rounded-[10px] mr-2 border bg-[rgba(69,105,135,0.60)] opacity-70' : '',
          isActive && useSecondary ? 'opacity-100 pointer-events-none bg-[rgba(69,105,135,0.60)] text-white' : '',
        )}
        style={{
          padding: "0 clamp(0.75rem, 3vw, 1rem)",
          marginLeft: "clamp(0.75rem, 2vw, 1rem)",
          // backgroundColor: backgroundColor,
          color: textColor,
          border: isActive
            ? "none"
            : useSecondary
              ? "2px solid #899AA9"
              : "none",
          borderRight: "none",
          overflow: "visible",
        }}
      >
        {isActive && !useSecondary && (
          <div className="absolute inset-0 pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 271 62"
              fill="none"
              preserveAspectRatio="none"
              className="sidebar-active-tab-svg h-[calc(100%+16px)] absolute top-[-8px] left-0 w-[calc(100%-clamp(0.75rem,2vw,1rem))]"
            >
              <path
                d="M11.3154 53.2325H252.577C263.709 53.2325 269.87 54.5883 270.46 61.9261V0C270.175 9.17424 264.767 10.8348 252.577 10.8934H11.3154C5.0638 10.8934 0 15.9572 0 22.2088V41.917C0 48.1648 5.0638 53.2325 11.3154 53.2325Z"
                fill="#ffffff"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </svg>
          </div>
        )}

        {/* Secondary sidebar active */}
        {isActive && useSecondary && (
          <div className="absolute inset-0 border rounded-l-[10px] border-[rgba(255,255,255,0.4)]">
          </div>
        )}
        {isEditing ? (
          <div
            className={`w-full h-full flex items-center justify-start gap-2 relative z-10 ${isActive ? "top-[2px]" : ""}`}
          >
            {canDrag && !isSummaryItem && (
              <span
                onMouseDown={onMouseDownDrag}
                className={cn('text-xl font-light select-none mr-1 cursor-grab active:cursor-grabbing', isActive ? "text-black/40" : "text-white/40", isActive && useSecondary ? 'text-white' : '')}
              >
                =
              </span>
            )}
            <button
              data-icon-picker-trigger
              onClick={onIconPickerTrigger}
              className={`flex items-center gap-1 shrink-0 hover:bg-black/5 rounded p-1 transition-colors ${isActive ? "text-black" : "text-white"} ${isActive && useSecondary ? 'text-white' : ''}`}
              style={{ color: "inherit" }}
            >
              <div className="flex items-center justify-center">
                {isCategoryItem &&
                  itemCategoryNumber !== null &&
                  getCategoryIcon(itemCategoryNumber)
                  ? renderIcon(getCategoryIcon(itemCategoryNumber))
                  : item.icon}
              </div>
              <ChevronDown size={14} />
            </button>
            <input
              ref={inputRef}
              type="text"
              defaultValue={getCategoryName(itemCategoryNumber as number)}
              onBlur={(e) => {
                if (itemCategoryNumber !== null) {
                  const isIconTrigger = (
                    e.relatedTarget as HTMLElement
                  )?.closest("[data-icon-picker-trigger]");

                  onCategoryNameUpdate(e.target.value);

                  if (!isIconTrigger) {
                    setEditingCategory(null);
                  }
                }
              }}
              onKeyDown={(e) => {
                if (itemCategoryNumber !== null) {
                  if (e.key === "Enter") {
                    onCategoryNameUpdate(e.currentTarget.value);
                    setEditingCategory(null);
                  } else if (e.key === "Escape") {
                    setEditingCategory(null);
                  }
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-transparent outline-none border-none text-left min-w-0 p-0"
              style={{
                color: "inherit",
                fontFamily: "'Acumin Variable Concept', sans-serif",
                fontWeight: 500,
                fontVariationSettings: "'wdth' 65, 'wght' 500",
                fontSize: "clamp(20px, 1.8vw, 27px)",
                letterSpacing: "0.006em",
                lineHeight: 1,
              }}
            />

            {/* Spacer to match the edit button width in viewing mode */}
            {isCategoryItem && itemCategoryNumber !== null && (
              <div className="w-5 shrink-0" />
            )}

            {/* Icon Picker Dropdown */}
            {editingIconCategory === itemCategoryNumber && (
              <div
                className="absolute top-full left-0 mt-1"
                style={{
                  zIndex: 99999,
                  overflow: "visible",
                  position: "absolute",
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <IconPicker
                  value={getCategoryIcon(itemCategoryNumber as number)}
                  onChange={(iconName) => {
                    onCategoryIconUpdate(iconName);
                    setEditingIconCategory(null);
                  }}
                  placeholder="Select icon"
                  showButton={false}
                  isOpen={true}
                  onClose={() => setEditingIconCategory(null)}
                />
              </div>
            )}
          </div>
        ) : (
          <div
            className={`w-full h-full flex items-center justify-start gap-2 relative z-10 ${isActive ? "top-[2px]" : ""} ${isActive && useSecondary ? 'text-white' : ''}`}
          >
            <div className={`flex-1 flex items-center justify-start`}>
              {canDrag && !isSummaryItem && (
                <span
                  onMouseDown={onMouseDownDrag}
                  className={`text-xl font-light select-none ml-1 cursor-grab active:cursor-grabbing ${isActive ? "text-black/40" : "text-white/40"} ${isActive && useSecondary ? 'text-white' : ''}  `}

                >
                  =
                </span>
              )}
              {(!isActive ||
                (isCategoryItem && itemCategoryNumber !== null)) && (
                  <div
                    className={`flex items-center justify-center shrink-0 ${isActive ? "text-black" : "text-white"} ${isActive && useSecondary ? 'text-white' : ''}`}
                  >
                    {isCategoryItem &&
                      itemCategoryNumber !== null &&
                      getCategoryIcon(itemCategoryNumber)
                      ? <span className='mr-3'> {renderIcon(getCategoryIcon(itemCategoryNumber))}</span>
                      : item.icon}
                  </div>
                )}
              <div
                className={`flex-1 flex items-center gap-4 text-left ${item?.name?.length > 50 ? "text-[13px]" : "text-sm"} wrap-break-word`}
              >
                <span
                  className={`${isActive ? "text-left" : "flex-1 text-left"} uppercase wrap-break-word leading-none line-clamp-1`}
                  style={{
                    fontFamily: "'Acumin Variable Concept', sans-serif",
                    fontWeight: 500,
                    fontSize: "clamp(20px, 1.8vw, 27px)",
                    letterSpacing: "0.006em",
                    fontVariationSettings: "'wdth' 65, 'wght' 500",
                  }}
                >
                  {item.name}
                </span>
              </div>
            </div>

            {isCategoryItem && itemCategoryNumber !== null && onEditClick && (
              <button
                onClick={onEditClick}
                className={`p-1 rounded hover:bg-white/20 cursor-pointer flex items-center shrink-0 ${isActive && useSecondary ? 'text-white' : ''}`}
                style={{ color: "inherit" }}
                aria-label="Edit category name"
              >
                <FiEdit size={12} />
              </button>
            )}
          </div>
        )}
      </div>
    );
  },
);

SidebarItem.displayName = "SidebarItem";

export default SidebarItem;
