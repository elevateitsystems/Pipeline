"use client";

import { useUser } from "@/contexts/UserContext";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useLogout } from "@/lib/hooks";
import Image from "next/image";
import logo from "@/public/logo.png";
import { useState, useEffect, useMemo, useCallback } from "react";
import summary from "@/public/summary.png";
import toast from "react-hot-toast";
import SidebarItem from "./SidebarItem";
import SidebarHeader from "./SidebarHeader";
import SidebarResults from "./SidebarResults";
import SidebarFooter from "./SidebarFooter";
import {
  // Business & Strategy
  Target,
  Award,
  Briefcase,
  Building,
  Building2,
  Landmark,
  Store,
  ShoppingCart,

  // Performance & Analytics
  TrendingUp,
  TrendingDown,
  BarChart,
  PieChart,
  LineChart,
  Activity,
  Gauge,
  Zap,

  // People & Teams
  Users,
  User,
  UserCheck,
  UserCog,
  UserPlus,
  Contact,
  Handshake,

  // Quality & Compliance
  Shield,
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  BadgeCheck,
  ClipboardCheck,

  // Innovation & Ideas
  Lightbulb,
  Rocket,
  Sparkles,
  Star,
  Trophy,
  Crown,
  Gem,

  // Communication & Feedback
  MessageSquare,
  Mail,
  Phone,
  Bell,
  Megaphone,
  Radio,

  // Documentation & Files
  FileText,
  File,
  Folder,
  FolderOpen,
  Clipboard,
  BookOpen,
  Notebook,

  // Finance & Money
  DollarSign,
  CreditCard,
  Wallet,
  Coins,
  Calculator,

  // Technology & Tools
  Settings,
  Cog,
  Wrench,
  Cpu,
  Database,
  Server,

  // Time & Planning
  Calendar,
  Clock,
  Timer,
  Hourglass,
  CalendarCheck,
  CalendarClock,
  List,
  CheckSquare,
} from "lucide-react";

// Mapping for dynamic icon rendering without bundling the whole library
const IconMap: Record<
  string,
  React.ComponentType<{ className?: string; size?: number }>
> = {
  // Business & Strategy
  Target,
  Award,
  Briefcase,
  Building,
  Building2,
  Landmark,
  Store,
  ShoppingCart,

  // Performance & Analytics
  TrendingUp,
  TrendingDown,
  BarChart,
  PieChart,
  LineChart,
  Activity,
  Gauge,
  Zap,

  // People & Teams
  Users,
  User,
  UserCheck,
  UserCog,
  UserPlus,
  Contact,
  Handshake,

  // Quality & Compliance
  Shield,
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  BadgeCheck,
  ClipboardCheck,

  // Innovation & Ideas
  Lightbulb,
  Rocket,
  Sparkles,
  Star,
  Trophy,
  Crown,
  Gem,

  // Communication & Feedback
  MessageSquare,
  Mail,
  Phone,
  Bell,
  Megaphone,
  Radio,

  // Documentation & Files
  FileText,
  File,
  Folder,
  FolderOpen,
  Clipboard,
  BookOpen,
  Notebook,
  List,
  CheckSquare,

  // Finance & Money
  DollarSign,
  CreditCard,
  Wallet,
  Coins,
  Calculator,

  // Technology & Tools
  Settings,
  Cog,
  Wrench,
  Cpu,
  Database,
  Server,

  // Time & Planning
  Calendar,
  Clock,
  Timer,
  Hourglass,
  CalendarCheck,
  CalendarClock,
};
type NavigationItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
  categoryNumber?: number;
};

export default function Sidebar() {
  const { user, isInvitedUser } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [editingIconCategory, setEditingIconCategory] = useState<number | null>(
    null,
  );
  const [categoryNames, setCategoryNames] = useState<Record<number, string>>(
    {},
  );
  const [categoryIcons, setCategoryIcons] = useState<Record<number, string>>(
    {},
  );
  const [draggedCategoryIndex, setDraggedCategoryIndex] = useState<
    number | null
  >(null);
  const [dragOverCategoryIndex, setDragOverCategoryIndex] = useState<
    number | null
  >(null);
  const [actualCategoryCount, setActualCategoryCount] = useState<number>(7);
  const [dragHandleCategory, setDragHandleCategory] = useState<number | null>(
    null,
  );
  const [isTestSidebarLoading, setIsTestSidebarLoading] =
    useState<boolean>(false);

  // Load test result data for summary overview
  const [testResultData, setTestResultData] = useState<{
    totalScore: number;
    categoryScores: Array<{
      categoryId: string;
      categoryName: string;
      score: number;
      maxScore: number;
    }>;
  } | null>(null);

  // Get user's primary color with opacity
  const primaryColor = user?.primaryColor || "#2B4055";
  const secondaryColor = user?.secondaryColor || "#F7AF41";

  // Set mounted after hydration to prevent SSR mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load test result data for summary overview
  useEffect(() => {
    if (typeof window === "undefined") return;
    const loadTestResult = () => {
      try {
        const stored = sessionStorage.getItem("testResultData");
        if (stored) {
          setTestResultData(JSON.parse(stored));
        } else {
          setTestResultData(null);
        }
      } catch {
        setTestResultData(null);
      }
    };
    loadTestResult();
    window.addEventListener("testResultUpdated", loadTestResult);
    return () =>
      window.removeEventListener("testResultUpdated", loadTestResult);
  }, []);

  // Load category names from sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const loadCategoryNames = () => {
      const names: Record<number, string> = {};
      for (let i = 1; i <= 7; i++) {
        try {
          const storedName = sessionStorage.getItem(
            `auditData:categoryName:${i}`,
          );
          if (storedName && storedName.trim()) {
            names[i] = storedName;
          } else {
            // Try to get from auditData categories array
            const raw = sessionStorage.getItem("auditData");
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed?.categories)) {
                const cat = parsed.categories[i - 1];
                if (cat?.name) {
                  names[i] = cat.name;
                }
              }
            }
          }
        } catch { }
      }
      setCategoryNames(names);
    };

    loadCategoryNames();

    // Listen for storage changes from other components (cross-tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith("auditData:categoryName:")) {
        loadCategoryNames();
      }
    };

    // Listen for custom event from same tab (when sidebar updates category name)
    const handleCategoryNameUpdate = () => {
      loadCategoryNames();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("categoryNameUpdated", handleCategoryNameUpdate);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "categoryNameUpdated",
        handleCategoryNameUpdate,
      );
    };
  }, []);

  // Calculate actual category count for create mode and test mode
  useEffect(() => {
    if (typeof window === "undefined") return;

    const calculateCategoryCount = () => {
      const onNewAuditPage = pathname === "/add-new-audit";
      const onTestPage = pathname === "/test";
      const presentationId = searchParams.get("presentationId");

      // Only calculate for create mode or test mode
      if (!onNewAuditPage && !(onTestPage && presentationId)) {
        setActualCategoryCount(7); // Default to 7 for update mode
        return;
      }

      try {
        let count = 0;

        if (onNewAuditPage) {
          // Create mode: Count categories with questions
          const raw = sessionStorage.getItem("auditData");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed?.categories)) {
              const actualCategories = parsed.categories.filter(
                (cat: { questions?: Array<{ text?: string }> }) => {
                  return (
                    cat.questions &&
                    Array.isArray(cat.questions) &&
                    cat.questions.some(
                      (q: { text?: string }) =>
                        q.text && q.text.trim().length > 0,
                    )
                  );
                },
              );
              count = Math.max(1, actualCategories.length);
            }
          }
        } else if (onTestPage && presentationId) {
          // Test mode: Count categories with names
          for (let i = 1; i <= 7; i++) {
            const categoryName = sessionStorage.getItem(
              `auditData:categoryName:${i}`,
            );
            if (categoryName && categoryName.trim()) {
              count++;
            }
          }
          // Fallback to auditData if no names found
          if (count === 0) {
            const raw = sessionStorage.getItem("auditData");
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed?.categories)) {
                count = parsed.categories.length;
              }
            }
          }
        }

        if (count > 0) {
          setActualCategoryCount(count);
        } else {
          setActualCategoryCount(7); // Default if nothing found
        }
      } catch {
        setActualCategoryCount(7);
      }
    };

    calculateCategoryCount();

    // Listen for category updates
    const handleCategoryUpdate = () => {
      calculateCategoryCount();
    };

    window.addEventListener("categoryNameUpdated", handleCategoryUpdate);
    window.addEventListener("storage", handleCategoryUpdate);

    return () => {
      window.removeEventListener("categoryNameUpdated", handleCategoryUpdate);
      window.removeEventListener("storage", handleCategoryUpdate);
    };
  }, [pathname, searchParams]);

  // Track loading state shared from TestPresentation for sidebar skeletons
  useEffect(() => {
    if (typeof window === "undefined") return;

    const readLoadingState = () => {
      const stored = sessionStorage.getItem("testSidebarLoading");
      setIsTestSidebarLoading(stored === "true");
    };

    readLoadingState();

    const handleLoadingChange = () => {
      readLoadingState();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "testSidebarLoading") {
        readLoadingState();
      }
    };

    window.addEventListener("testSidebarLoadingChanged", handleLoadingChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        "testSidebarLoadingChanged",
        handleLoadingChange,
      );
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Set loading state true immediately on navigation to loading pages to prevent "flash" of old content
  useEffect(() => {
    const isLoadingPage = pathname === "/test" || pathname === "/update-audit";
    if (isLoadingPage) {
      // Check if we already have it in storage as false (e.g. already loaded)
      // but on initial navigation, we should prefer showing skeleton
      const stored = sessionStorage.getItem("testSidebarLoading");
      if (stored === "false") {
        setIsTestSidebarLoading(false);
      } else {
        setIsTestSidebarLoading(true);
      }
    } else {
      setIsTestSidebarLoading(false);
    }
  }, [pathname]);

  // Helper to get category name
  const getCategoryName = useCallback(
    (categoryNumber: number): string => {
      // Default fallback value - must be consistent for SSR and client
      const fallback = `Category ${categoryNumber}`;

      // First check if we have it in state (populated after mount)
      if (categoryNames[categoryNumber]) {
        return categoryNames[categoryNumber];
      }

      // During SSR or before hydration, always return fallback to prevent mismatch
      if (typeof window === "undefined" || !mounted) return fallback;

      // Only read from sessionStorage after hydration is complete
      try {
        const storedName = sessionStorage.getItem(
          `auditData:categoryName:${categoryNumber}`,
        );
        if (storedName && storedName.trim()) {
          return storedName;
        }
        const raw = sessionStorage.getItem("auditData");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed?.categories)) {
            const cat = parsed.categories[categoryNumber - 1];
            if (cat?.name) {
              return cat.name;
            }
          }
        }
      } catch { }
      return fallback;
    },
    [categoryNames, mounted],
  );

  // Helper to get category icon
  const getCategoryIcon = useCallback(
    (categoryNumber: number): string | undefined => {
      // First check if we have it in state
      if (categoryIcons[categoryNumber]) {
        return categoryIcons[categoryNumber];
      }

      // During SSR or before hydration, return undefined to prevent mismatch
      if (typeof window === "undefined" || !mounted) return undefined;

      // Only read from sessionStorage after hydration
      try {
        const storedIcon = sessionStorage.getItem(
          `auditData:categoryIcon:${categoryNumber}`,
        );
        if (storedIcon && storedIcon.trim()) {
          return storedIcon;
        }
        const raw = sessionStorage.getItem("auditData");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed?.categories)) {
            const cat = parsed.categories[categoryNumber - 1];
            if (cat?.icon) {
              return cat.icon;
            }
          }
        }
      } catch { }
      return undefined;
    },
    [categoryIcons, mounted],
  );

  // Helper to render icon component (supports both Lucide icons and custom URL icons)
  const renderIcon = useCallback((iconName: string | undefined) => {
    if (!iconName) return null;

    // Check if it's a custom URL icon
    if (iconName.startsWith("http")) {
      return (
        <Image
          src={iconName}
          alt="Custom icon"
          width={20}
          height={20}
          className="w-5 h-5 object-contain"
        />
      );
    }

    // Otherwise, try to render as Lucide icon from our optimized map
    const IconComponent = IconMap[iconName];
    if (!IconComponent) return null;
    return <IconComponent className="w-5 h-5" />;
  }, []);

  // Handle category name update
  const handleCategoryNameUpdate = (
    categoryNumber: number,
    newName: string,
  ) => {
    const finalName = newName.trim() || `Category ${categoryNumber}`;

    // Update state
    setCategoryNames((prev) => ({ ...prev, [categoryNumber]: finalName }));

    // Update sessionStorage
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        `auditData:categoryName:${categoryNumber}`,
        finalName,
      );

      // Also update auditData categories array
      try {
        const raw = sessionStorage.getItem("auditData");
        const data = raw ? JSON.parse(raw) : { categories: [] };
        if (!Array.isArray(data.categories)) data.categories = [];

        const idx = categoryNumber - 1;
        while (data.categories.length < categoryNumber) {
          data.categories.push({
            name: `Category ${data.categories.length + 1}`,
            questions: [],
          });
        }

        if (data.categories[idx]) {
          data.categories[idx].name = finalName;
        } else {
          data.categories[idx] = { name: finalName, questions: [] };
        }

        sessionStorage.setItem("auditData", JSON.stringify(data));

        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event("categoryNameUpdated"));
      } catch (e) {
        console.error("Error updating category name:", e);
      }
    }
  };

  // Handle category icon update
  const handleCategoryIconUpdate = (
    categoryNumber: number,
    iconName: string,
  ) => {
    setCategoryIcons((prev) => ({ ...prev, [categoryNumber]: iconName }));

    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        `auditData:categoryIcon:${categoryNumber}`,
        iconName,
      );

      // Also update auditData categories array
      try {
        const raw = sessionStorage.getItem("auditData");
        const data = raw ? JSON.parse(raw) : { categories: [] };
        if (!Array.isArray(data.categories)) data.categories = [];

        const idx = categoryNumber - 1;
        while (data.categories.length < categoryNumber) {
          data.categories.push({
            name: `Category ${data.categories.length + 1}`,
            questions: [],
          });
        }

        if (data.categories[idx]) {
          data.categories[idx].icon = iconName;
        } else {
          data.categories[idx] = {
            name: `Category ${categoryNumber}`,
            icon: iconName,
            questions: [],
          };
        }

        sessionStorage.setItem("auditData", JSON.stringify(data));

        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event("categoryNameUpdated"));
      } catch (e) {
        console.error("Error updating category icon:", e);
      }
    }

    setEditingIconCategory(null);
  };

  // Handle category drag and drop reordering (only on update-audit page)
  const handleCategoryDragStart = (
    e: React.DragEvent,
    categoryIndex: number,
  ) => {
    if (pathname !== "/update-audit") return;
    // Don't start drag if clicking on input, button, or other interactive elements
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "BUTTON" ||
      target.closest("input") ||
      target.closest("button")
    ) {
      e.preventDefault();
      return;
    }
    setDraggedCategoryIndex(categoryIndex);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", categoryIndex.toString());
  };

  const handleCategoryDragOver = (
    e: React.DragEvent,
    categoryIndex: number,
  ) => {
    if (pathname !== "/update-audit" || draggedCategoryIndex === null) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (categoryIndex !== draggedCategoryIndex) {
      setDragOverCategoryIndex(categoryIndex);
    }
  };

  const handleCategoryDragLeave = () => {
    setDragOverCategoryIndex(null);
  };

  const handleCategoryDrop = (e: React.DragEvent, targetIndex: number) => {
    if (pathname !== "/update-audit" || draggedCategoryIndex === null) {
      setDraggedCategoryIndex(null);
      setDragOverCategoryIndex(null);
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    // Use the dragOverCategoryIndex if available, otherwise use targetIndex
    // This ensures we use the last category we dragged over, not necessarily where we dropped
    const finalTargetIndex =
      dragOverCategoryIndex !== null ? dragOverCategoryIndex : targetIndex;

    if (draggedCategoryIndex === finalTargetIndex) {
      setDraggedCategoryIndex(null);
      setDragOverCategoryIndex(null);
      return;
    }

    // Reorder categories in sessionStorage - move entire category with all its data
    if (typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem("auditData");
        const data = raw ? JSON.parse(raw) : { categories: [] };
        if (!Array.isArray(data.categories)) data.categories = [];

        // Ensure we have 7 categories
        while (data.categories.length < 7) {
          data.categories.push({
            name: `Category ${data.categories.length + 1}`,
            questions: [],
          });
        }

        // Step 1: Save all data for all categories (old positions)
        const categoryDataMap: Record<
          number,
          {
            name: string;
            categoryData: string | null;
            questions: Record<number, string>;
            statuses: Record<number, string>;
            recommendation: string | null;
          }
        > = {};

        for (let catNum = 1; catNum <= 7; catNum++) {
          const categoryData = sessionStorage.getItem(
            `auditData:category:${catNum}`,
          );
          const categoryName = sessionStorage.getItem(
            `auditData:categoryName:${catNum}`,
          );
          const questions: Record<number, string> = {};
          const statuses: Record<number, string> = {};

          // Save all questions for this category
          for (let qNum = 1; qNum <= 10; qNum++) {
            const question = sessionStorage.getItem(
              `auditData:question:${catNum}:${qNum}`,
            );
            const status = sessionStorage.getItem(
              `auditData:status:${catNum}:${qNum}`,
            );
            if (question) questions[qNum] = question;
            if (status) statuses[qNum] = status;
          }

          categoryDataMap[catNum] = {
            name: categoryName || `Category ${catNum}`,
            categoryData,
            questions,
            statuses,
            recommendation: sessionStorage.getItem(
              `auditData:categoryRecommendation:${catNum}`,
            ),
          };
        }

        // Step 2: Reorder categories array
        // Create a proper reordering that moves the dragged item to the exact target position
        const newCategories = [...data.categories];
        const draggedCategory = newCategories[draggedCategoryIndex];

        // Calculate the correct target index for insertion
        // Remove the dragged item first
        newCategories.splice(draggedCategoryIndex, 1);

        // Calculate adjusted target index after removal
        // When dragging down (lower index to higher), after removal the target shifts down by 1
        // When dragging up (higher index to lower), the target position doesn't shift
        let adjustedTargetIndex: number;

        if (draggedCategoryIndex < finalTargetIndex) {
          // Dragging from lower index to higher index (dragging down in the list)
          // Example: drag index 0 to index 4 (want item at position 5, which is index 4)
          // Original: [cat1,cat2,cat3,cat4,cat5,cat6,cat7] (indices 0-6)
          // After removal: [cat2,cat3,cat4,cat5,cat6,cat7] (indices 0-5)
          // What was at index 4 (cat5) is now at index 3
          // To insert at the position that was index 4, we need index 3
          // But we want to insert AFTER cat5, so we need index 4 (which is now cat6's position)
          // Actually, we want to REPLACE cat5's position, so we need index 3
          // But user says it goes 1 step up, so maybe we want index 4?
          // Let's try: if user drags to category 5 (index 4), they want it AT position 5
          // After removal, to insert AT position 5 (index 4 in new array), we use index 4
          adjustedTargetIndex = finalTargetIndex; // Try without subtraction
        } else {
          // Dragging from higher index to lower index (dragging up in the list)
          // Example: drag index 6 to index 0
          // Original: [cat1,cat2,cat3,cat4,cat5,cat6,cat7] (indices 0-6)
          // After removal: [cat1,cat2,cat3,cat4,cat5,cat6] (indices 0-5)
          // Index 0 is still at index 0, so we use finalTargetIndex directly
          adjustedTargetIndex = finalTargetIndex;
        }

        // Insert at the adjusted target position
        newCategories.splice(adjustedTargetIndex, 0, draggedCategory);
        data.categories = newCategories;

        // Step 3: Create mapping from old position to new position
        // Build the mapping based on the actual reordering
        const oldToNewMap: Record<number, number> = {};

        // Create array of original indices [0, 1, 2, 3, 4, 5, 6]
        const originalIndices = Array.from({ length: 7 }, (_, i) => i);

        // Simulate the reordering to get final positions
        const finalIndices = [...originalIndices];
        finalIndices.splice(draggedCategoryIndex, 1);
        finalIndices.splice(adjustedTargetIndex, 0, draggedCategoryIndex);

        // Create mapping: old position -> new position
        originalIndices.forEach((originalIndex) => {
          const oldCatNum = originalIndex + 1; // Convert to 1-based category number
          const newArrayIndex = finalIndices.indexOf(originalIndex);
          const newCatNum = newArrayIndex + 1; // Convert to 1-based category number
          oldToNewMap[oldCatNum] = newCatNum;
        });

        // Step 4: Clear all existing category data
        for (let catNum = 1; catNum <= 7; catNum++) {
          sessionStorage.removeItem(`auditData:category:${catNum}`);
          sessionStorage.removeItem(`auditData:categoryName:${catNum}`);
          sessionStorage.removeItem(
            `auditData:categoryRecommendation:${catNum}`,
          );
          for (let qNum = 1; qNum <= 10; qNum++) {
            sessionStorage.removeItem(`auditData:question:${catNum}:${qNum}`);
            sessionStorage.removeItem(`auditData:status:${catNum}:${qNum}`);
          }
        }

        // Step 5: Write all data to new positions
        for (let oldCatNum = 1; oldCatNum <= 7; oldCatNum++) {
          const newCatNum = oldToNewMap[oldCatNum];
          const oldData = categoryDataMap[oldCatNum];

          // Write category name
          sessionStorage.setItem(
            `auditData:categoryName:${newCatNum}`,
            oldData.name,
          );
          sessionStorage.setItem(
            `auditData:categoryRecommendation:${newCatNum}`,
            oldData.recommendation || "",
          );

          // Write category data
          if (oldData.categoryData) {
            sessionStorage.setItem(
              `auditData:category:${newCatNum}`,
              oldData.categoryData,
            );
          } else {
            // If no category data exists, create from questions and statuses
            const questionsArray = Object.keys(oldData.questions)
              .map((qNum) => {
                const questionText = oldData.questions[Number(qNum)];
                const statusData = oldData.statuses[Number(qNum)];
                const options = statusData
                  ? JSON.parse(statusData).map((text: string, idx: number) => ({
                    text,
                    points: idx + 1,
                  }))
                  : Array.from({ length: 5 }, (_, idx) => ({
                    text: `Option ${idx + 1}`,
                    points: idx + 1,
                  }));

                return {
                  text: questionText || "",
                  options,
                };
              })
              .filter((q) => q.text);

            const categoryObj = {
              name: oldData.name,
              recommendation: oldData.recommendation || "",
              questions: questionsArray,
            };
            sessionStorage.setItem(
              `auditData:category:${newCatNum}`,
              JSON.stringify(categoryObj),
            );
          }

          // Write all questions
          Object.keys(oldData.questions).forEach((qNum) => {
            sessionStorage.setItem(
              `auditData:question:${newCatNum}:${qNum}`,
              oldData.questions[Number(qNum)],
            );
          });

          // Write all statuses
          Object.keys(oldData.statuses).forEach((qNum) => {
            sessionStorage.setItem(
              `auditData:status:${newCatNum}:${qNum}`,
              oldData.statuses[Number(qNum)],
            );
          });
        }

        // Step 6: Update main auditData with reordered categories
        // Rebuild categories array from sessionStorage to ensure consistency
        const reorderedCategories = newCategories.map((cat, index) => {
          const categoryNumber = index + 1;
          const categoryDataStr = sessionStorage.getItem(
            `auditData:category:${categoryNumber}`,
          );
          if (categoryDataStr) {
            try {
              return JSON.parse(categoryDataStr);
            } catch {
              return cat;
            }
          }
          return cat;
        });

        data.categories = reorderedCategories;
        sessionStorage.setItem("auditData", JSON.stringify(data));

        // Step 7: Reorder summary data (categoryRecommendations) to match new category order
        const summaryDataStr = sessionStorage.getItem("summaryData");
        if (summaryDataStr) {
          try {
            const summaryData = JSON.parse(summaryDataStr);
            if (
              summaryData.categoryRecommendations &&
              Array.isArray(summaryData.categoryRecommendations)
            ) {
              const oldRecommendations: Array<{
                categoryId: string;
                recommendation: string;
              }> = summaryData.categoryRecommendations;
              const reorderedRecommendations: Array<{
                categoryId: string;
                recommendation: string;
              }> = [];

              // Build new recommendations array based on oldToNewMap
              for (
                let oldPos = 1;
                oldPos <= oldRecommendations.length;
                oldPos++
              ) {
                const recommendation = oldRecommendations[oldPos - 1];
                if (!recommendation) continue;

                const newPos = oldToNewMap[oldPos] ?? oldPos;
                const newCategory = reorderedCategories[newPos - 1];
                const newCategoryId =
                  newCategory?.id || recommendation.categoryId || "";

                reorderedRecommendations[newPos - 1] = {
                  categoryId: newCategoryId,
                  recommendation: recommendation.recommendation || "",
                };
              }

              // Ensure array has entries for all categories
              for (let idx = 0; idx < reorderedCategories.length; idx++) {
                if (!reorderedRecommendations[idx]) {
                  reorderedRecommendations[idx] = {
                    categoryId: reorderedCategories[idx]?.id || "",
                    recommendation: "",
                  };
                }
              }

              summaryData.categoryRecommendations = reorderedRecommendations;
              sessionStorage.setItem(
                "summaryData",
                JSON.stringify(summaryData),
              );
              window.dispatchEvent(new Event("summaryDataUpdated"));
            }
          } catch (error) {
            console.error("Error reordering summary data:", error);
            // Don't fail the category reorder if summary update fails
          }
        }

        // Step 8: Reload category names for UI
        const names: Record<number, string> = {};
        for (let i = 1; i <= 7; i++) {
          const name = sessionStorage.getItem(`auditData:categoryName:${i}`);
          names[i] = name || `Category ${i}`;
        }
        setCategoryNames(names);

        // Dispatch event to update sidebar and other components
        window.dispatchEvent(new Event("categoryNameUpdated"));

        // Dispatch specific event for category reorder to notify UpdateAudit
        window.dispatchEvent(
          new CustomEvent("categoriesReordered", {
            detail: {
              oldToNewMap: oldToNewMap,
              reorderedCategories: reorderedCategories,
            },
          }),
        );

        // Update URL if user is viewing one of the moved categories
        const currentCategory = parseInt(
          new URLSearchParams(window.location.search).get("category") || "1",
          10,
        );
        const editId = searchParams.get("edit");

        // Find the new position of the currently viewed category
        const newCategoryPosition = oldToNewMap[currentCategory];

        if (newCategoryPosition && newCategoryPosition !== currentCategory) {
          // Navigate to the new category position to show the moved category
          const newUrl = `/update-audit?${editId ? `edit=${editId}&` : ""}category=${newCategoryPosition}`;
          router.push(newUrl);
        } else if (
          currentCategory === draggedCategoryIndex + 1 ||
          currentCategory === finalTargetIndex + 1
        ) {
          // If viewing one of the directly moved categories, reload to refresh
          window.location.reload();
        }
        // Otherwise, no action needed - data is updated and sidebar will refresh
      } catch (e) {
        console.error("Error reordering categories:", e);
        toast.error("Failed to reorder categories. Please try again.");
      }
    }

    setDraggedCategoryIndex(null);
    setDragOverCategoryIndex(null);
  };

  const logoutMutation = useLogout();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      window.location.href = "/signin";
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.href = "/signin";
    }
  };

  const navigationItems: NavigationItem[] = useMemo(
    () => [
      {
        name: "ALL AUDITS",
        href: "/",
        icon: "",
      },
      ...(isInvitedUser
        ? []
        : [
          {
            name: "ALL TEAM MEMBERS",
            href: "/invited-users",
            icon: "",
          },
        ]),
      ...(user?.role === "ADMIN"
        ? [
          {
            name: "ADMIN DASHBOARD",
            href: "/admin",
            icon: "",
          },
        ]
        : []),
    ],
    [isInvitedUser, user?.role],
  );

  const onNewAuditPage = pathname === "/add-new-audit";
  const onUpdateAuditPage = pathname === "/update-audit";
  const onSummaryPage = pathname === "/summary";
  const onTestPage = pathname === "/test";
  const onResultPage = pathname === "/test/result";
  const onMainPage = pathname === "/";
  const shouldShowTestSkeleton =
    (onTestPage || onUpdateAuditPage) && isTestSidebarLoading;

  const effectiveItems = useMemo(() => {
    let items: NavigationItem[] = [];

    if (onMainPage) {
      items = [...navigationItems];
    } else if (
      (onNewAuditPage || onUpdateAuditPage || onSummaryPage || onTestPage) &&
      !onMainPage
    ) {
      const editId = searchParams.get("edit");
      const presentationId = searchParams.get("presentationId");
      let basePath = "/add-new-audit";
      if (onUpdateAuditPage) basePath = "/update-audit";
      if (onSummaryPage) {
        basePath = editId ? "/update-audit" : "/add-new-audit";
      }
      if (onTestPage) basePath = "/test";

      const categoryCount =
        onTestPage && presentationId ? actualCategoryCount : 7;

      const defaultIcons = [
        "Folder",
        "FileText",
        "List",
        "CheckSquare",
        "PieChart",
        "BarChart",
        "Settings",
      ];

      const categoryItems = Array.from({ length: categoryCount }, (_, i) => {
        const categoryNumber = i + 1;
        const query = new URLSearchParams();
        if (onUpdateAuditPage && editId) query.set("edit", editId);
        if (onTestPage && presentationId)
          query.set("presentationId", presentationId);
        query.set("category", String(categoryNumber));
        const defaultIconName = defaultIcons[i % defaultIcons.length];

        return {
          categoryNumber,
          name: getCategoryName(categoryNumber),
          href: `${basePath}?${query.toString()}`,
          icon: renderIcon(getCategoryIcon(categoryNumber) || defaultIconName),
        };
      });

      const summaryItem =
        onNewAuditPage || onUpdateAuditPage
          ? (() => {
            const summaryQuery = new URLSearchParams();
            if (onUpdateAuditPage && editId) summaryQuery.set("edit", editId);
            summaryQuery.set("category", "8");
            return {
              name: "Summary",
              href: `${basePath}?${summaryQuery.toString()}`,
              icon: (
                <Image src={summary} alt="Summary" width={20} height={20} />
              ),
            };
          })()
          : null;

      items = summaryItem
        ? [...categoryItems, summaryItem]
        : [...categoryItems];
    } else {
      items = [...navigationItems];
    }
    return items;
  }, [
    onMainPage,
    onNewAuditPage,
    onUpdateAuditPage,
    onSummaryPage,
    onTestPage,
    navigationItems,
    searchParams,
    actualCategoryCount,
    getCategoryIcon,
    getCategoryName,
    renderIcon,
  ]);

  if (!user) {
    return null;
  }

  return (
    <div
      className="sidebar-width flex flex-col h-full overflow-x-hidden relative hide-scrollbar"
      // className="sidebar-width flex flex-col h-full overflow-x-hidden relative hide-scrollbar"
      style={{
        overflowX: "hidden",
        position: "relative",
        // backgroundColor: "",
      }}
    >
      <SidebarHeader
        onResultPage={onResultPage}
        router={router}
        user={user}
        logo={logo}
        summary={summary}
        secondaryColor={secondaryColor}
      />

      {/* Navigation - Scrollable section */}
      <nav
        className=" flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar"
        style={{
          position: "relative",
          zIndex: 2,
          gap: "clamp(0.5rem, 1.25vw, 1rem)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {onResultPage ? (
          <SidebarResults
            testResultData={testResultData}
            secondaryColor={secondaryColor}
          />
        ) : (
          //comment
          <>
            {(onNewAuditPage ||
              onUpdateAuditPage ||
              onSummaryPage ||
              onTestPage) &&
              !onMainPage && (
                <div
                  className="sidebar-header-text px-8 text-center text-[#fffef7] uppercase text-[20px] lg:text-[25px] mt-3.5"
                  style={{
                    fontFamily: "'Acumin Variable Concept', sans-serif",
                    fontWeight: 500,
                    // fontSize: "clamp(20px, 1.8vw, 27px)",
                    lineHeight: "1",
                    letterSpacing: "0.006em",
                    fontVariationSettings: "'wdth' 65, 'wght' 500",
                  }}
                >
                  AUDIT CATGORIES
                </div>
              )}
            {shouldShowTestSkeleton
              ? Array.from(
                { length: Math.max(actualCategoryCount, 4) },
                (_, index) => (
                  <div
                    key={`sidebar-skeleton-${index}`}
                    className={`min-h-[40px] bg-white/10 overflow-hidden ${onTestPage
                      ? "w-[calc(100%-clamp(0.75rem,2vw,1rem)+2px)] rounded-l-xl"
                      : "w-[88%] rounded-xl"
                      }`}
                    style={{
                      marginLeft: "clamp(0.75rem, 2vw, 1rem)",
                    }}
                  >
                    <div className="h-full w-full animate-pulse bg-white/25" />
                  </div>
                ),
              )
              : effectiveItems.map((item) => {
                // Functionality (edit and drag-and-drop) is only allowed on edit and create pages
                // This selectively "comments out" the functionality on presentation/test pages.
                let isActive = pathname === item.href;
                const isCategoryItem =
                  "categoryNumber" in item &&
                  typeof item.categoryNumber === "number";
                const itemCategoryNumber =
                  isCategoryItem && item.categoryNumber !== undefined
                    ? item.categoryNumber
                    : null;
                if (
                  (onNewAuditPage &&
                    item.href.startsWith("/add-new-audit")) ||
                  (onUpdateAuditPage &&
                    item.href.startsWith("/update-audit")) ||
                  (onTestPage && item.href.startsWith("/test"))
                ) {
                  const currentCategory = searchParams.get("category");
                  const itemCategory = new URLSearchParams(
                    item.href.split("?")[1],
                  ).get("category");
                  isActive = currentCategory === itemCategory;
                }
                if (onSummaryPage) {
                  if (item.name === "Summary") {
                    isActive = true;
                  } else {
                    isActive = false;
                  }
                }
                const useSecondary =
                  onNewAuditPage || onUpdateAuditPage || onSummaryPage;
                const isTestPageCategory = onTestPage && isCategoryItem;
                const isEditing =
                  itemCategoryNumber !== null &&
                  editingCategory === itemCategoryNumber;
                const isNavigationItem =
                  !isCategoryItem && item.name !== "Summary";

                let backgroundColor = "white";
                let textColor = primaryColor;

                if (useSecondary) {
                  backgroundColor = isActive ? "transparent" : secondaryColor;
                  textColor = isActive ? "black" : "white";
                } else if (isTestPageCategory) {
                  backgroundColor = isActive ? "transparent" : secondaryColor;
                  textColor = isActive ? "black" : "white";
                } else if (isNavigationItem && !isActive) {
                  backgroundColor = secondaryColor;
                  textColor = "white";
                } else {
                  backgroundColor = isActive ? "transparent" : "white";
                  textColor = isActive ? "black" : secondaryColor;
                }

                const isDragging =
                  isCategoryItem &&
                  itemCategoryNumber !== null &&
                  draggedCategoryIndex === itemCategoryNumber - 1;
                const isDragOver =
                  isCategoryItem &&
                  itemCategoryNumber !== null &&
                  dragOverCategoryIndex === itemCategoryNumber - 1;
                // Edit options allowed on both create and edit pages
                const canEdit =
                  isCategoryItem &&
                  itemCategoryNumber !== null &&
                  (pathname === "/update-audit" ||
                    pathname === "/add-new-audit");

                // Drag and drop ONLY allowed on edit (update) page, not on create page
                const canDrag =
                  isCategoryItem &&
                  itemCategoryNumber !== null &&
                  pathname === "/update-audit" &&
                  item.name !== "Summary";

                const isSummaryItem = item.name === "Summary";

                return (
                  <SidebarItem
                    key={item.name}
                    item={item}
                    isActive={isActive}
                    isEditing={isEditing}
                    isCategoryItem={isCategoryItem}
                    itemCategoryNumber={itemCategoryNumber}
                    backgroundColor={backgroundColor}
                    textColor={textColor}
                    isDragging={isDragging}
                    isDragOver={isDragOver}
                    canDrag={canDrag}
                    isSummaryItem={isSummaryItem}
                    useSecondary={useSecondary}
                    onDragStart={(e) => {
                      if (!canDrag || isSummaryItem) {
                        e.preventDefault();
                        return;
                      }
                      if (
                        itemCategoryNumber === null ||
                        dragHandleCategory !== itemCategoryNumber
                      ) {
                        e.preventDefault();
                        return;
                      }
                      handleCategoryDragStart(e, itemCategoryNumber - 1);
                    }}
                    onDragEnd={() => setDragHandleCategory(null)}
                    onDragOver={
                      canDrag && !isSummaryItem
                        ? (e) =>
                          handleCategoryDragOver(e, itemCategoryNumber! - 1)
                        : () => { }
                    }
                    onDragLeave={
                      canDrag && !isSummaryItem
                        ? handleCategoryDragLeave
                        : () => { }
                    }
                    onDrop={
                      canDrag && !isSummaryItem
                        ? (e) =>
                          handleCategoryDrop(e, itemCategoryNumber! - 1)
                        : () => { }
                    }
                    onItemClick={() => {
                      const isNonCategoryItem = itemCategoryNumber === null;
                      const canNavigate =
                        !isEditing &&
                        (isSummaryItem ||
                          isNonCategoryItem ||
                          (itemCategoryNumber !== null &&
                            editingIconCategory !== itemCategoryNumber));

                      if (canNavigate) {
                        router.push(item.href);
                      }
                    }}
                    onEditClick={
                      canEdit
                        ? (e) => {
                          e.stopPropagation();
                          if (itemCategoryNumber !== null) {
                            setEditingCategory(itemCategoryNumber);
                            if (item.href) {
                              router.push(item.href);
                            }
                          }
                        }
                        : undefined
                    }
                    onMouseDownDrag={
                      canDrag
                        ? () => {
                          if (itemCategoryNumber !== null) {
                            setDragHandleCategory(itemCategoryNumber);
                          }
                        }
                        : undefined
                    }
                    onIconPickerTrigger={(e) => {
                      e.stopPropagation();
                      if (itemCategoryNumber !== null) {
                        setEditingIconCategory(itemCategoryNumber);
                      }
                    }}
                    onCategoryNameUpdate={(newName) => {
                      if (itemCategoryNumber !== null) {
                        handleCategoryNameUpdate(itemCategoryNumber, newName);
                      }
                    }}
                    onCategoryIconUpdate={(iconName) => {
                      if (itemCategoryNumber !== null) {
                        handleCategoryIconUpdate(
                          itemCategoryNumber,
                          iconName,
                        );
                      }
                    }}
                    editingIconCategory={editingIconCategory}
                    setEditingIconCategory={setEditingIconCategory}
                    setEditingCategory={setEditingCategory}
                    getCategoryName={getCategoryName}
                    getCategoryIcon={getCategoryIcon}
                    renderIcon={renderIcon}
                  />
                );
              })}
          </>
        )}
      </nav>

      <SidebarFooter
        onResultPage={onResultPage}
        user={user}
        handleLogout={handleLogout}
        router={router}
        secondaryColor={secondaryColor}
      />
    </div>
  );
}
