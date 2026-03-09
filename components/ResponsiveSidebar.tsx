"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useUser } from "@/contexts/UserContext";
import { X } from "lucide-react";

const MOBILE_BREAKPOINT = 1024;

export default function ResponsiveSidebar() {
  const { user } = useUser();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = useMemo(
    () => `${pathname}?${searchParams.toString()}`,
    [pathname, searchParams],
  );
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(MOBILE_BREAKPOINT);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const updateViewport = () => {
      const nextViewportWidth = window.innerWidth;
      const nextIsMobile = nextViewportWidth < MOBILE_BREAKPOINT;
      setViewportWidth(nextViewportWidth);
      setIsMobile(nextIsMobile);
      if (!nextIsMobile) {
        setIsOpen(false);
      }
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [routeKey]);

  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isMobile, isOpen]);

  useEffect(() => {
    if (!isMobile) {
      document.body.style.overflow = "";
    }
  }, [isMobile]);

  const sidebarWidth = viewportWidth < 640 ? 336 : 392;
  const primaryColor = user?.primaryColor || "#2B4055";
  const hexToRgb = (hex: string): [number, number, number] | null => {
    const cleanHex = hex.replace("#", "");
    const fullHex =
      cleanHex.length === 3
        ? cleanHex
            .split("")
            .map((char) => char + char)
            .join("")
        : cleanHex;

    if (fullHex.length !== 6) return null;

    const r = parseInt(fullHex.substring(0, 2), 16);
    const g = parseInt(fullHex.substring(2, 4), 16);
    const b = parseInt(fullHex.substring(4, 6), 16);

    return [r, g, b];
  };

  const rgb = hexToRgb(primaryColor);
  const overlayColor = rgb
    ? `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.92)`
    : "rgba(43, 64, 85, 0.92)";

  const mobileOverlay =
    mounted && isMobile
      ? createPortal(
          <>
            <button
              type="button"
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isOpen}
              onClick={() => setIsOpen((prev) => !prev)}
              className="fixed left-4 top-4 z-[120] flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-[#23384C]/92 text-white shadow-[0_18px_40px_rgba(0,0,0,0.24)] backdrop-blur-sm transition-transform hover:scale-[1.02]"
            >
              {isOpen ? (
                <X className="h-6 w-6" strokeWidth={2.2} />
              ) : (
                <span className="flex flex-col gap-1.5">
                  <span className="block h-0.5 w-5 rounded-full bg-white" />
                  <span className="block h-0.5 w-5 rounded-full bg-white" />
                  <span className="block h-0.5 w-5 rounded-full bg-white" />
                </span>
              )}
            </button>

            <div
              className={`fixed inset-0 z-[110] transition-opacity duration-300 ${
                isOpen
                  ? "pointer-events-auto opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            >
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setIsOpen(false)}
                className="absolute inset-0 bg-black/48 backdrop-blur-[2px]"
              />

              <div
                className={`absolute inset-y-0 left-0 transition-transform duration-300 ease-out ${
                  isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
              >
                <div
                  className="relative h-full overflow-hidden border-r border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.30)]"
                  style={{
                    width: `${sidebarWidth}px`,
                    backgroundImage: "url(/bg-img-final.webp)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: overlayColor }}
                  />
                  <Sidebar
                    width={sidebarWidth}
                    className="relative z-10 h-full"
                  />
                </div>
              </div>
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <>
      {!isMobile && <Sidebar />}
      {mobileOverlay}
    </>
  );
}
