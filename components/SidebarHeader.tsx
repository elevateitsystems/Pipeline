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
    <div
      className="py-11 border-b-2 flex justify-center shrink-0"
      style={{
        position: "relative",
        zIndex: 2,
        borderColor: secondaryColor || "#456987",
      }}
    >
      {onResultPage ? (
        <div className="flex items-center gap-3 px-4">
          <Image src={summary} alt="Logo" width={70} height={60} />
          <span className="text-white font-normal text-3xl">
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
            height: "clamp(40px, 8vw, 60px)",
            objectFit: "contain",
          }}
        />
      )}
    </div>
  );
};

export default SidebarHeader;
