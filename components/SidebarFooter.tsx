"use client";

import { SessionUser } from "@/lib/session";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Image from "next/image";
import { CustomButton } from "./common";

interface SidebarFooterProps {
  onResultPage: boolean;
  user: SessionUser;
  handleLogout: () => void;
  router: AppRouterInstance;
  secondaryColor?: string;
}

const SidebarFooter = ({
  onResultPage,
  user,
  handleLogout,
  router,
  secondaryColor,
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
        <div
          className="px-4 mt-6 border-t-2"
          style={{ borderColor: secondaryColor || "#456987" }}
        >
          <div className="mt-4">
            <h3 className="text-2xl text-white mb-3  text-center">
              Testimonials
            </h3>
            <div className="space-y-4">
              <div
                className="rounded-lg p-3 text-center"
                style={{ backgroundColor: secondaryColor || "#456987" }}
              >
                <p className="text-[#E8E8E8]  ">
                  This audit system has transformed how we track and improve our
                  processes. The comprehensive scoring and detailed
                  recommendations help us identify areas for urgent attention.
                </p>
              </div>
              <div
                className="rounded-lg p-3 text-center"
                style={{ backgroundColor: secondaryColor || "#456987" }}
              >
                <p className="text-[#E8E8E8]  font-normal">
                  The category-based assessment structure makes it easy to focus
                  on specific areas. The summary overview provides clear
                  insights for continuous improvement.
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 items-center justify-center gap-2 mb-8 mt-4 sidebar-bottom-info">
            <CustomButton
              onClick={handleLogout}
              className="text-[23px] flex items-center gap-2 text-black hover:opacity-90 transition-colors rounded-full"
              style={{ fontSize: "inherit" }}
            >
              Logout
            </CustomButton>

            <button
              onClick={() => router.push("/")}
              className="w-full py-1 h-10 cursor-pointer rounded-full hover:bg-black/5 bg-transparent border border-white/50  text-white transition-colors text-center"
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
