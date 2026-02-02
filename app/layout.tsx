import type { Metadata } from "next";
import "./globals.css";
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="en">
      <body>
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
