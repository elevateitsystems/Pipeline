"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import * as LucideIcons from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useIcones, useCreateIcone } from "@/lib/hooks";
import axios from "axios";
import Image from "next/image";

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
  placeholder?: string;
  className?: string;
  showButton?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

// Curated lucide-react icons list - most commonly used icons
const POPULAR_ICONS = [
  // Basic UI & Actions
  "Folder",
  "FileText",
  "Settings",
  "User",
  "Users",
  "Edit",
  "Trash",
  "Save",
  "Copy",
  "Download",
  "Upload",
  "Plus",
  "Minus",
  "X",
  "Check",
  "Search",
  "Filter",
  "Grid",
  "List",
  "Menu",
  "MoreHorizontal",
  "MoreVertical",

  // Navigation & Arrows
  "ArrowRight",
  "ArrowLeft",
  "ArrowUp",
  "ArrowDown",
  "ChevronDown",
  "ChevronLeft",
  "ChevronRight",
  "ChevronUp",
  "Home",
  "Navigation",
  "Compass",
  "Map",
  "MapPin",
  "Globe",
  "Link",
  "ExternalLink",

  // Communication
  "Mail",
  "MessageSquare",
  "Phone",
  "Video",
  "Camera",
  "Mic",
  "Bell",
  "Share",
  "Send",

  // Media & Files
  "Image",
  "Music",
  "Film",
  "Play",
  "Pause",
  "Stop",
  "Volume2",
  "File",
  "Files",
  "FolderOpen",
  "FolderPlus",
  "FileCheck",
  "FileX",
  "FileImage",
  "FileVideo",
  "FileAudio",
  "FileCode",
  "FileZip",

  // Data & Charts
  "BarChart",
  "PieChart",
  "LineChart",
  "TrendingUp",
  "TrendingDown",
  "Activity",
  "Pulse",
  "Gauge",

  // Status & Alerts
  "CheckCircle",
  "AlertCircle",
  "AlertTriangle",
  "Info",
  "Star",
  "Heart",
  "Bookmark",
  "Tag",
  "Flag",
  "Target",
  "Award",
  "Trophy",
  "Medal",
  "Crown",

  // Time & Calendar
  "Calendar",
  "Clock",
  "Timer",
  "History",

  // Security & Access
  "Lock",
  "Unlock",
  "Shield",
  "Key",
  "Eye",
  "EyeOff",
  "Fingerprint",

  // Tools & Utilities
  "Scissors",
  "Printer",
  "Wrench",
  "Tool",
  "Hammer",
  "Cog",
  "Settings2",
  "Zap",
  "Battery",
  "Wifi",
  "Power",
  "PowerOff",
  "RefreshCw",
  "RefreshCcw",
  "RotateCw",
  "RotateCcw",

  // Business & Finance
  "ShoppingCart",
  "CreditCard",
  "DollarSign",
  "Coins",
  "Briefcase",
  "Building",
  "Store",
  "Receipt",

  // Education & Learning
  "Book",
  "BookOpen",
  "GraduationCap",
  "School",
  "Library",

  // Technology
  "Code",
  "Database",
  "Server",
  "Cloud",
  "Computer",
  "Laptop",
  "Smartphone",
  "Tablet",
  "Monitor",
  "Cpu",
  "HardDrive",
  "Usb",
  "Bluetooth",
  "WifiOff",

  // Design & Creative
  "Palette",
  "PenTool",
  "Paintbrush",
  "Layers",
  "LayoutDashboard",
  "Frame",

  // Shapes & Symbols
  "Circle",
  "Square",
  "Triangle",
  "Hexagon",
  "Diamond",

  // Weather & Nature
  "Sun",
  "Moon",
  "CloudRain",
  "CloudSnow",
  "CloudLightning",
  "Umbrella",
  "Droplet",
  "Flame",
  "Leaf",
  "Tree",
  "Flower",
  "Mountain",

  // Social & Brand
  "Facebook",
  "Twitter",
  "Instagram",
  "Linkedin",
  "Youtube",
  "Github",
  "Gitlab",
  "Dribbble",
  "Slack",

  // Miscellaneous
  "Package",
  "Box",
  "Archive",
  "Gift",
  "Rocket",
  "Lightbulb",
  "Sparkles",
  "Wand2",
  "QrCode",
  "Scan",
  "Barcode",
  "Ticket",
  "Tags",
  "Pin",
  "Paperclip",
  "Clipboard",
  "StickyNote",
  "Notebook",
  "Pen",
  "Pencil",
  "Highlighter",
  "Calculator",
  "Stopwatch",
  "Coffee",
  "Utensils",
  "ShoppingBag",
  "ShoppingBasket",
  "Car",
  "Plane",
  "Train",
  "Bike",
  "Ship",
  "Truck",
  "Gamepad",
  "Tv",
  "Radio",
  "Headphones",
  "Speaker",
  "Smile",
  "Laugh",
  "Meh",
  "Frown",
  "HelpCircle",
  "XCircle",
  "PlusCircle",
  "MinusCircle",
  "Maximize",
  "Minimize",
  "Shrink",
  "Move",
  "Undo",
  "Redo",
  "Cut",
  "Paste",
  "Bold",
  "Italic",
  "Underline",
  "Strikethrough",
  "AlignLeft",
  "AlignCenter",
  "AlignRight",
  "AlignJustify",
  "ListOrdered",
  "LogIn",
  "LogOut",
  "UserPlus",
  "UserMinus",
  "UserCheck",
  "UserX",
] as const;

export default function IconPicker({
  value,
  onChange,
  placeholder = "Select an icon",
  className = "",
  showButton = true,
  isOpen: controlledIsOpen,
  onClose,
}: IconPickerProps) {
  const { user } = useUser();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user's custom icons
  const { data: iconesData } = useIcones(user?.id || null);
  const createIconeMutation = useCreateIcone();

  // Ensure we're mounted (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use controlled isOpen if provided, otherwise use internal state
  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (value: boolean | ((prev: boolean) => boolean)) => {
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(value);
    } else if (onClose && !value) {
      onClose();
    }
  };

  // Filter icons based on search query
  const filteredLucideIcons = searchQuery.trim()
    ? POPULAR_ICONS.filter((icon) =>
      icon.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    : POPULAR_ICONS;

  const customIcons = iconesData?.data || [];
  const filteredCustomIcons = searchQuery.trim()
    ? customIcons.filter((icon) =>
      icon.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    : customIcons;

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (!(target instanceof Element)) {
        return;
      }

      if (dropdownRef.current && dropdownRef.current.contains(target)) {
        return;
      }

      if (target.closest("[data-icon-picker-dropdown]")) {
        return;
      }

      if (containerRef.current && containerRef.current.contains(target)) {
        return;
      }

      if (controlledIsOpen === undefined) {
        setInternalIsOpen(false);
      } else if (onClose) {
        onClose();
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside, true);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [isOpen, controlledIsOpen, onClose]);

  // Calculate dropdown position when it opens
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const updatePosition = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownHeight = 350;
      const dropdownWidth = 320;

      let top = showButton ? rect.bottom + 4 : rect.top;
      let left = rect.left;

      if (top + dropdownHeight > window.innerHeight) {
        top = showButton
          ? rect.top - dropdownHeight - 4
          : rect.bottom - dropdownHeight;
      }

      if (left + dropdownWidth > window.innerWidth) {
        left = window.innerWidth - dropdownWidth - 10;
      }

      if (left < 10) {
        left = 10;
      }

      setDropdownPosition({ top, left });
    };

    updatePosition();

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, showButton]);

  const handleIconSelect = (iconName: string) => {
    onChange(iconName);
    setSearchQuery("");
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const handleCustomIconSelect = (iconUrl: string) => {
    onChange(iconUrl);
    setSearchQuery("");
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
    );

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      uploadData,
    );
    return response.data.secure_url;
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    setUploading(true);
    try {
      const iconUrl = await uploadToCloudinary(file);
      const iconName = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension

      await createIconeMutation.mutateAsync({
        name: iconName,
        userId: user.id,
        iconUrl: iconUrl,
      });

      // Select the newly uploaded icon
      handleCustomIconSelect(iconUrl);
    } catch (error) {
      console.error("Error uploading icon:", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = (
      LucideIcons as unknown as Record<
        string,
        React.ComponentType<{ className?: string; size?: number }>
      >
    )[iconName];
    if (!IconComponent) return null;
    return <IconComponent className="w-5 h-5" />;
  };

  const selectedIconComponent = value ? getIconComponent(value) : null;
  const isCustomIcon = value?.startsWith("http");

  return (
    <div
      className={`relative ${className}`}
      ref={containerRef}
      style={{ zIndex: isOpen ? 99999 : "auto", position: "relative" }}
    >
      {/* Trigger Button - only show if showButton is true */}
      {showButton && (
        <button
          type="button"
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
          style={{ position: "relative", zIndex: isOpen ? 99999 : "auto" }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {value ? (
              isCustomIcon ? (
                <>
                  <Image
                    src={value}
                    alt="Custom icon"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                  <span className="text-gray-700 truncate">Custom Icon</span>
                </>
              ) : (
                <>
                  {selectedIconComponent}
                  <span className="text-gray-700 truncate">{value}</span>
                </>
              )
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""
              }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Dropdown - Render via Portal to escape overflow constraints */}
      {isOpen &&
        mounted &&
        createPortal(
          <div
            ref={dropdownRef}
            data-icon-picker-dropdown
            className="bg-white border border-gray-200 rounded-xl shadow-2xl"
            style={{
              width: "clamp(250px, 20vw, 288px)",
              height: "clamp(280px, 20vh, 312px)",
              display: "flex",
              flexDirection: "column",
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              zIndex: 99999,
              position: "fixed",
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {/* Header with Search and Upload */}
            <div className="p-3 border-b border-gray-100 flex items-center gap-2">
              {/* Search Input */}
              <div className="flex-1 relative">
                <LucideIcons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search icon"
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              {/* Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="p-2 bg-gray-900 hover:bg-gray-800 text-white rounded-full transition-colors shrink-0 disabled:opacity-50"
                title="Upload custom icon"
              >
                {uploading ? (
                  <LucideIcons.Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LucideIcons.Upload className="w-4 h-4" />
                )}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setIsOpen(false);
                  if (onClose) onClose();
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
              >
                <LucideIcons.X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Icons Grid */}
            <div className="flex-1 overflow-y-auto p-3">
              {/* Custom Icons Section */}
              {filteredCustomIcons.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
                    Your Icons
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {filteredCustomIcons.map((icon) => (
                      <button
                        key={icon.id}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCustomIconSelect(icon.iconUrl);
                        }}
                        className={`p-2 bg-gray-50 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors aspect-square ${value === icon.iconUrl
                          ? "ring-2 ring-blue-500 bg-blue-50"
                          : "border border-gray-200"
                          }`}
                        title={icon.name}
                      >
                        <Image
                          src={icon.iconUrl}
                          alt={icon.name}
                          width={20}
                          height={20}
                          className="object-contain"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Lucide Icons Section */}
              <div>
                {filteredCustomIcons.length > 0 && (
                  <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
                    Standard Icons
                  </p>
                )}
                <div className="grid grid-cols-5 gap-2">
                  {filteredLucideIcons.map((iconName) => {
                    const IconComponent = (
                      LucideIcons as unknown as Record<
                        string,
                        React.ComponentType<{
                          className?: string;
                          size?: number;
                        }>
                      >
                    )[iconName];
                    if (!IconComponent) return null;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleIconSelect(iconName);
                        }}
                        className={`p-2 text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors aspect-square ${value === iconName
                          ? "ring-2 ring-blue-500 bg-blue-50"
                          : "border border-gray-200"
                          }`}
                        title={iconName}
                      >
                        <IconComponent className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* No results */}
              {filteredLucideIcons.length === 0 &&
                filteredCustomIcons.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <LucideIcons.SearchX className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      No icons found for &quot;{searchQuery}&quot;
                    </p>
                  </div>
                )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
