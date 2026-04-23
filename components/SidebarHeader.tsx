"use client";

import { SessionUser } from "@/lib/session";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Image, { StaticImageData } from "next/image";

interface SidebarHeaderProps {
  onResultPage: boolean;
  router: AppRouterInstance;
  user: SessionUser;
  logo: StaticImageData;
  summary: StaticImageData;
  secondaryColor?: string;
}

const SidebarHeader = ({
  onResultPage,
  router,
  user,
  logo,
  summary,
  secondaryColor,
}: SidebarHeaderProps) => {
  return (
    <>
      <div
        className="pt-10 2xl:pt-[51px] pb-7 2xl:pb-10 flex justify-center shrink-0"
        style={{
          position: "relative",
          zIndex: 2,
          // borderColor: "#456987",
        }}
      >
        {onResultPage ? (
          <div className="flex justify-center px-10">
            <div className="flex items-center gap-3">
              <Image
                src={summary}
                alt="Logo"
                width={70}
                height={60}
                className="2xl:h-[72px] h-[50px] w-auto object-contain"
              />
              <span className="text-white font-normal text-[1.5rem] 2xl:text-[1.94rem] leading-none">
                Summary Overview
              </span>
            </div>
          </div>
        ) : (
          <Image
            onClick={() => router.push("/")}
            className=""
            src={user?.company?.logoUrl || logo}
            alt="Logo"
            width={70}
            height={60}
            style={{
              // width: "clamp(120px, 15vw, 168px)",
              // height: "clamp(40px, 8vw, 57px)",
              objectFit: "contain",
            }}
          />
        )}
      </div>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="2"
        viewBox="0 0 300 2"
        fill="none"
      >
        <path
          d="M0 0.750183H299.315"
          stroke="#1F2F3D"
          strokeWidth="1.50039"
          strokeMiterlimit="10"
        />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="2"
        viewBox="0 0 300 2"
        fill="none"
      >
        <path
          d="M0 0.750183H299.315"
          stroke={secondaryColor}
          strokeWidth="1.50039"
          strokeMiterlimit="10"
        />
      </svg>
    </>
  );
};

export default SidebarHeader;
