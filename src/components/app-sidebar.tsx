"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  ChartBar,
  ChefHat,
  LayoutDashboard,
  MessageSquareShare,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations();

  const navItems = [
    {
      title: t("navigation.dashboard"),
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: t("navigation.restaurants"),
      url: "/restaurants",
      icon: ChefHat,
    },
    {
      title: t("navigation.reservations"),
      url: "/reservations",
      icon: BookOpen,
    },
    {
      title: t("navigation.promotions"),
      url: "/promotions",
      icon: MessageSquareShare,
    },
    {
      title: t("navigation.chatbots"),
      url: "/chatbots",
      icon: Bot,
    },
    {
      title: t("navigation.customers"),
      url: "/customers",
      icon: User,
    },
    {
      title: t("navigation.analytics"),
      url: "/analytics",
      icon: ChartBar,
    },
  ];

  return (
    <Sidebar
      className="top-[--header-height] !h-[calc(100svh-var(--header-height))]"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div>
              <a href="/" className="flex items-center gap-4">
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <div className="rounded-xl bg-sidebar px-5 py-3">
                    <Image
                      src="/logo.png"
                      alt={t("sidebar.logo.alt")}
                      width={70}
                      height={70}
                      className="h-16 w-auto"
                    />
                  </div>
                </div>
              </a>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
    </Sidebar>
  );
}
