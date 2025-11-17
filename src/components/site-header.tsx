"use client";

import { SidebarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import Image from "next/image";
import { NavUser } from "./nav-user";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-50 flex h-full w-full items-center bg-sidebar">
      <div className="flex h-[--header-height] w-full items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button
            className="h-8 w-8 text-background"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
          >
            <SidebarIcon />
          </Button>
          <a href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt={"Chefbot Logo"}
              width={56}
              height={56}
              className="h-14 w-auto"
            />
          </a>
        </div>
        <div className="">
          <NavUser />
        </div>
      </div>
    </header>
  );
}
