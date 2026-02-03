"use client";

import { useEffect, useState, ReactNode } from "react";

export default function ScalingWrapper({ children }: { children: ReactNode }) {
  const [scales, setScales] = useState({ x: 1, y: 1 });

  useEffect(() => {
    const handleResize = () => {
      const targetWidth = 1920;
      const targetHeight = 1080;

      const widthScale = window.innerWidth / targetWidth;
      const heightScale = window.innerHeight / targetHeight;
      setScales({ x: widthScale, y: heightScale });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className="scaling-outer-container"
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 10,
      }}
    >
      <div
        className="scaling-inner-canvas"
        style={{
          width: "1920px",
          height: "1080px",
          transform: `scale(${scales.x}, ${scales.y})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  );
}
