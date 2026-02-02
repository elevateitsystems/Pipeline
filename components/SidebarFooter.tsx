"use client";

import React from "react";
import Image from "next/image";
import { CustomButton } from "./common";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { SessionUser } from "@/lib/session";

interface SidebarFooterProps {
  onResultPage: boolean;
  user: SessionUser;
  handleLogout: () => void;
  router: AppRouterInstance;
}

const SidebarFooter = ({
  onResultPage,
  user,
  handleLogout,
  router,
}: SidebarFooterProps) => {
  return (
    <div
      className="pt-2 mt-auto overflow-hidden shrink-0"
      style={{
        position: "relative",
        zIndex: 2,
        paddingBottom: "clamp(.5rem, 3vw, .75rem)",
      }}
    >
      {onResultPage ? (
        <div>
          <div className="px-4 mt-6">
            <h3 className="text-lg text-white mb-3 uppercase text-center">
              Testimonials
            </h3>
            <div className="space-y-4">
              <div className="bg-white/10 rounded-lg p-3  text-center">
                <p className="text-white text-xs leading-relaxed ">
                  This audit system has transformed how we track and improve our
                  processes. The comprehensive scoring and detailed
                  recommendations help us identify areas for urgent attention.
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-3  text-center">
                <p className="text-white text-xs leading-relaxed ">
                  The category-based assessment structure makes it easy to focus
                  on specific areas. The summary overview provides clear
                  insights for continuous improvement.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-8 sidebar-bottom-info px-4">
            <CustomButton
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 text-white hover:text-gray-300 transition-colors"
              style={{ fontSize: "inherit" }}
            >
              Logout
            </CustomButton>

            <button
              onClick={() => router.push("/")}
              className="flex-1 py-1 h-10 cursor-pointer rounded-full bg-transparent border border-white/50  font-semibold text-white transition-colors text-center"
            >
              Exit
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            className="flex items-center justify-center"
            style={{ marginBottom: "clamp(0.25rem, 1vw, 0.5rem)" }}
          >
            {user.profileImageUrl ? (
              <Image
                className="sidebar-profile-image w-[210px] h-[230px] object-cover cursor-pointer"
                src={user.profileImageUrl}
                alt="Profile"
                width={210}
                height={230}
                onClick={() => router.push("/profile")}
                style={{
                  width: "clamp(100px, 18vw, 210px)",
                  height: "clamp(120px, 25vh, 230px)",
                  objectPosition: "center 20%",
                  border: `5px solid ${user.secondaryColor}`,
                }}
              />
            ) : (
              <div
                className="rounded bg-gray-300 flex items-center justify-center cursor-pointer"
                onClick={() => router.push("/profile")}
                style={{
                  width: "clamp(100px, 18vw, 210px)",
                  height: "clamp(120px, 25vh, 230px)",
                }}
              >
                <span
                  className="font-medium text-gray-700 sidebar-bottom-info"
                  style={{ fontSize: "clamp(1rem, 4vw, 1.5rem)" }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <p
            className="font-medium text-white text-center underline cursor-pointer sidebar-bottom-info"
            style={{
              fontSize: "clamp(0.875rem, 3vw, 1.125rem)",
              marginTop: "clamp(0.25rem, 1vw, 0.5rem)",
            }}
            onClick={handleLogout}
          >
            Logout
          </p>
        </>
      )}
    </div>
  );
};

export default SidebarFooter;
