"use client";

import { useEffect, useState, ReactNode } from "react";

export default function ScalingWrapper({ children }: { children: ReactNode }) {
    const [layout, setLayout] = useState({
        scale: 1,
        canvasWidth: 1920,
        canvasHeight: 1080,
    });
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const targetWidth = 1920;
            const targetHeight = 1080;

            const scaleX = window.innerWidth / targetWidth;
            const scaleY = window.innerHeight / targetHeight;

            // Use uniform scale — pick the SMALLER ratio so content
            // always fits without distortion.
            const uniformScale = Math.min(scaleX, scaleY);

            // Expand the canvas to fill whichever dimension has leftover
            // space.  For example on a tall viewport the canvas height
            // grows so the layout can use the extra room instead of
            // leaving an empty stripe.
            const canvasWidth = window.innerWidth / uniformScale;
            const canvasHeight = window.innerHeight / uniformScale;

            setLayout({ scale: uniformScale, canvasWidth, canvasHeight });
            setIsReady(true);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div
            className="scaling-outer-container"
            style={{
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 10,
                opacity: isReady ? 1 : 0,
                transition: 'opacity 0.2s ease-in-out',
                backgroundColor: 'transparent'
            }}
        >
            <div
                className="scaling-inner-canvas"
                style={{
                    width: `${layout.canvasWidth}px`,
                    height: `${layout.canvasHeight}px`,
                    transform: `scale(${layout.scale})`,
                    transformOrigin: 'top left',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {children}
            </div>
        </div>
    );
}
