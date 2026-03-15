"use client";

import React from "react";
import Image from "next/image";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { SessionUser } from "@/lib/session";
import { StaticImageData } from "next/image";

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
    <div>
      <div
        className="py-8 flex justify-center shrink-0"
        style={{
          position: "relative",
          zIndex: 2,
          // borderColor: "#456987",
        }}
      >


        {onResultPage ? (
          <div className="flex items-center gap-3 px-4">
            <Image src={summary} alt="Logo" width={70} height={60} />
            <span className="text-white text-[1.94rem]">
              Summary Overview
            </span>
          </div>
        ) : (
          <Image
            onClick={() => router.push("/")}
            className="cursor-pointer sidebar-logo"
            src={user?.company?.logoUrl || logo}
            alt="Logo"
            width={168}
            height={60}
            style={{
              width: "clamp(120px, 15vw, 168px)",
              height: "clamp(40px, 8vw, 57px)",
              objectFit: "contain",
            }}
          />
        )}
      </div>

      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="2" viewBox="0 0 300 2" fill="none">
        <path d="M0 0.750183H299.315" stroke="#1F2F3D" strokeWidth="1.50039" strokeMiterlimit="10" />
      </svg>
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="2" viewBox="0 0 300 2" fill="none">
        <path d="M0 0.750183H299.315" stroke={secondaryColor} strokeWidth="1.50039" strokeMiterlimit="10" />
      </svg>
    </div>
  );
};

export default SidebarHeader;
