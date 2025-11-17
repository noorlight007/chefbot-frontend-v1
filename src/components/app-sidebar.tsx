"use client";

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
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

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
            <a href="/" className="flex items-center gap-3">
              <div className="grid flex-1 text-left text-sm leading-tight">
                <div className="px-2 py-2">
                  <span className="text-sm font-semibold">
                    {t("sidebar.title")}
                  </span>
                </div>
              </div>
            </a>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
    </Sidebar>
  );
}
