"use client";

import { useUser } from "@/contexts/UserContext";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import logo from "@/public/logo.png";
import { useState, useEffect, useMemo } from "react";
import summary from "@/public/summary.png";
import SidebarItem from "./SidebarItem";
import SidebarHeader from "./SidebarHeader";
import SidebarResults from "./SidebarResults";
import SidebarFooter from "./SidebarFooter";
import { DEMO_CATEGORIES } from "@/lib/demo-data";
import { Target, Activity, Users, TrendingUp } from "lucide-react";
import { apiClient } from "@/lib/fetcher";

const IconMap: Record<string, any> = {
  Target,
  Activity,
  Users,
  TrendingUp,
};

export default function DemoSidebar() {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [testResultData, setTestResultData] = useState<any>(null);

  const primaryColor = user?.primaryColor || "#2B4055";
  const secondaryColor = user?.secondaryColor || "#F7AF41";

  const handleLogout = async () => {
    try {
      await apiClient.post("/api/logout");
      if (typeof window !== "undefined") {
        sessionStorage.clear();
      }
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      if (typeof window !== "undefined") {
        sessionStorage.clear();
      }
      router.push("/login");
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

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
    return () => window.removeEventListener("testResultUpdated", loadTestResult);
  }, []);

  const onResultPage = pathname === "/demo/result";
  const currentCategory = searchParams.get("category");

  const effectiveItems = useMemo(() => {
    return DEMO_CATEGORIES.map((cat, i) => {
      const categoryNumber = i + 1;
      const IconComponent = IconMap[cat.icon];
      return {
        categoryNumber,
        name: cat.name,
        href: `/demo?category=${categoryNumber}`,
        icon: IconComponent ? <IconComponent size={20} /> : null,
      };
    });
  }, []);

  const renderIcon = (iconName: string | undefined) => {
    if (!iconName) return null;
    const IconComponent = IconMap[iconName];
    if (!IconComponent) return null;
    return <IconComponent size={20} />;
  };

  if (!user || !mounted) {
    return null;
  }

  return (
    <div className="sidebar-width flex flex-col min-h-screen overflow-x-hidden relative hide-scrollbar" style={{ position: "relative" }}>
      <SidebarHeader
        onResultPage={onResultPage}
        router={router}
        user={user}
        logo={logo}
        summary={summary}
        secondaryColor={secondaryColor}
      />

      <nav className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar mt-3" style={{ position: "relative", zIndex: 2, gap: "clamp(0.5rem, 1.25vw, 1rem)", display: "flex", flexDirection: "column" }}>
        {onResultPage ? (
          <SidebarResults
            testResultData={testResultData}
            secondaryColor={secondaryColor}
          />
        ) : (
          <>
            <div className="sidebar-header-text px-8 text-center text-[#fffef7] uppercase text-[20px] lg:text-[25px] mt-6 lg:mb-1.5" style={{ fontWeight: 500, lineHeight: "1", letterSpacing: "0.006em", fontVariationSettings: "'wdth' 65, 'wght' 400" }}>
              Audit CATEGORIES
            </div>
            {effectiveItems.map((item) => {
              const isActive = currentCategory === String(item.categoryNumber);
              return (
                <SidebarItem
                  key={item.href}
                  item={item}
                  isActive={isActive}
                  isEditing={false}
                  isCategoryItem={true}
                  itemCategoryNumber={item.categoryNumber}
                  backgroundColor={isActive ? "transparent" : secondaryColor}
                  textColor={isActive ? "black" : "white"}
                  isDragging={false}
                  isDragOver={false}
                  canDrag={false}
                  isSummaryItem={false}
                  useSecondary={false}
                  onDragStart={() => {}}
                  onDragEnd={() => {}}
                  onDragOver={() => {}}
                  onDragLeave={() => {}}
                  onDrop={() => {}}
                  onItemClick={() => router.push(item.href)}
                  onIconPickerTrigger={() => {}}
                  onCategoryNameUpdate={() => {}}
                  onCategoryIconUpdate={() => {}}
                  editingIconCategory={null}
                  setEditingIconCategory={() => {}}
                  setEditingCategory={() => {}}
                  getCategoryName={(num) => DEMO_CATEGORIES[num - 1]?.name || ""}
                  getCategoryIcon={(num) => DEMO_CATEGORIES[num - 1]?.icon}
                  renderIcon={renderIcon}
                  secondaryColor={secondaryColor}
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
