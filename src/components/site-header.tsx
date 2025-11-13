"use client";

import { SidebarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import Image from "next/image";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-50 flex h-full w-full items-center bg-sidebar">
      <div className="flex h-[--header-height] w-full items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button
            className="h-8 w-8 text-background"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
          >
            <SidebarIcon />
          </Button>
        </div>
        <div className=" block sm:hidden">
          <Image
            src="/logo.png"
            alt={"Chefbot Logo"}
            width={70}
            height={70}
            className="h-10 w-auto"
          />
        </div>
        <div className="">
          <NavUser />
        </div>
      </div>
    </header>
  );
}
