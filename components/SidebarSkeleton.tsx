"use client";

import React from "react";

const SidebarSkeleton = () => {
  return (
    <div className="sidebar-width flex flex-col h-full overflow-hidden bg-transparent animate-pulse">
      <div className="py-11 border-b-2 border-[#456987] flex justify-center shrink-0">
        <div className="h-10 w-32 bg-white/20 rounded-md" />
      </div>
      <div className="py-4 flex-1 space-y-4 px-4">
        <div className="h-6 w-3/4 bg-white/10 rounded-md mx-auto mb-8" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-[68px] w-full bg-white/10 rounded-xl" />
        ))}
      </div>
      <div className="p-4 mt-auto">
        <div className="h-48 w-full bg-white/10 rounded-lg" />
      </div>
    </div>
  );
};

export default SidebarSkeleton;
