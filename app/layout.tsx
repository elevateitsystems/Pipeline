import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { UserProvider } from "@/contexts/UserContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ReactQueryProvider } from "@/lib/react-query";
import { getSession } from "@/lib/session";
import Sidebar from "@/components/Sidebar";
import SidebarSkeleton from "@/components/SidebarSkeleton";
import BackgroundWrapper from "@/components/BackgroundWrapper";
import { Toaster } from "react-hot-toast";
import { Suspense } from "react";

import ScalingWrapper from "@/components/ScalingWrapper";

export const metadata: Metadata = {
  title: "Pipeline Conversation",
  description: "Simple Quiz App that summarizes you in a few questions",
};

const acumin = localFont({
  src: [
    {
      path: "../public/fonts/AcuminVariableConcept.otf",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../public/fonts/AcuminVariableConcept.ttf",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-acumin",
  display: "swap",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="en" className={acumin.variable}>
      <body className="font-acumin">
        <ReactQueryProvider>
          <UserProvider user={session}>
            <ThemeProvider>
              <BackgroundWrapper>
                <ScalingWrapper>
                  {session ? (
                    <div className="flex h-full w-full">
                      <Suspense fallback={<SidebarSkeleton />}>
                        <Sidebar />
                      </Suspense>
                      <main className="flex-1">{children}</main>
                    </div>
                  ) : (
                    <main className="h-full w-full bg-[#2B4055B2]">
                      {children}
                    </main>
                  )}
                </ScalingWrapper>
              </BackgroundWrapper>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: "#fff",
                    color: "#333",
                    fontFamily: "Acumin Variable Concept",
                  },
                  success: {
                    iconTheme: {
                      primary: "#16a34a",
                      secondary: "#fff",
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: "#dc2626",
                      secondary: "#fff",
                    },
                  },
                }}
              />
            </ThemeProvider>
          </UserProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
