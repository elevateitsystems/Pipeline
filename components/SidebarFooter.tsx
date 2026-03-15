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
    <div className="mt-5">
      {onResultPage ? (<><svg xmlns="http://www.w3.org/2000/svg" width="300" height="2" viewBox="0 0 300 2" fill="none">
        <path d="M0 0.750183H299.315" stroke="#1F2F3D" strokeWidth="1.50039" strokeMiterlimit="10" />
      </svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="300" height="2" viewBox="0 0 300 2" fill="none">
          <path d="M0 0.750183H299.315" stroke={secondaryColor} strokeWidth="1.50039" strokeMiterlimit="10" />
        </svg></>) : ''
      }
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
            className="px-4 mt-6"
          // style={{ borderColor: secondaryColor || "#456987" }}
          >
            <div className="mt-4">
              <h3 className="text-[27px] text-white mb-3  text-center">
                Testimonials
              </h3>
              <div className="space-y-4">
                <div
                  className="rounded-2xl h-[120px] p-3 text-center"
                  style={{ backgroundColor: (secondaryColor || "#456987") + "80" }}
                >
                  <p className="text-[#E8E8E8] text-[16px] ">
                    This system transformed our tracking. Detailed scoring helps
                    identify urgent improvements.
                  </p>
                </div>
                <div
                  className="rounded-2xl p-3 text-center h-[120px]"
                  style={{ backgroundColor: (secondaryColor || "#456987") + "80" }}
                >
                  <p className="text-[#E8E8E8] text-[16px] font-normal">
                    Category-based assessments make it easy to focus and gain
                    insights for improvement.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 items-center justify-center gap-2 mb-8 mt-4 sidebar-bottom-info">
              <CustomButton
                onClick={handleLogout}
                className="text-[18px] flex items-center gap-2 text-black hover:opacity-90 transition-colors rounded-full"
                style={{ fontSize: "inherit" }}
              >
                Logout
              </CustomButton>

              <button
                onClick={() => router.push("/")}
                className="w-full h-10 py-2 cursor-pointer rounded-full hover:bg-black/5 bg-transparent border border-white/50 text-[18px]  text-white transition-colors text-center"
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
                    width: "clamp(130px, 38vw, 210px)",
                    height: "clamp(150px, 28vh, 230px)",
                    objectPosition: "center 20%",
                    border: `5px solid ${user.secondaryColor}`,
                  }}
                />
              ) : (
                <div
                  className="rounded bg-gray-300 flex items-center justify-center cursor-pointer"
                  onClick={() => router.push("/profile")}
                  style={{
                    width: "clamp(130px, 38vw, 210px)",
                    height: "clamp(150px, 28vh, 230px)",
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
    </div >
  );
};

export default SidebarFooter;
