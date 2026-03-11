"use client";

import { useUser } from "@/contexts/UserContext";

export default function BackgroundWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();

  // Get the user's primary color, default to the original overlay color if not available
  const overlayColor = user?.primaryColor || "#1f2b3480"; // rgba(31,43,52,0.5) converted to hex

  // Convert hex to RGB for rgba overlay
  const hexToRgb = (hex: string): [number, number, number] | null => {
    // Remove # if present
    const cleanHex = hex.replace("#", "");

    // Handle 3-digit hex
    let fullHex = cleanHex;
    if (cleanHex.length === 3) {
      fullHex = cleanHex
        .split("")
        .map((char) => char + char)
        .join("");
    }

    if (fullHex.length !== 6) return null;

    const r = parseInt(fullHex.substring(0, 2), 16);
    const g = parseInt(fullHex.substring(2, 4), 16);
    const b = parseInt(fullHex.substring(4, 6), 16);

    return [r, g, b];
  };

  const rgb = hexToRgb(overlayColor);
  const overlayRgba = rgb
    ? `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.70)`
    : "rgba(31,43,52,0.5)"; // Fallback to original color

  return (
    <div
      className="relative min-h-screen"
      style={{
        backgroundImage: "url(/bg-img-final.webp)",
        backgroundSize: "contain",
      }}
    >
      {/* Dynamic Overlay */}
      <div
        className="absolute h-ful w-full inset-0 z-0 bg-[rgba(31,43,52,0.4)]"
        style={{
          backgroundColor: overlayRgba,
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
}
