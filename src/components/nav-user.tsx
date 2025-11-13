"use client";

import { LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/reducers/auth-slice";
import { useGetLoggedUserQuery } from "@/redux/reducers/auth-reducer";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function NavUser() {
  const { isMobile } = useSidebar();
  const dispatch = useAppDispatch();
  const { data } = useGetLoggedUserQuery({});
  const t = useTranslations("profile.navUser");
 
  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="rounded-full">
        <div className="cursor-pointer p-0 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
          <Avatar className="h-10 w-10 rounded-full border-2 border-sidebar-accent">
            <AvatarImage
              src={data?.avatar}
              alt={`${data?.first_name} ${data?.last_name}`}
              className="object-cover"
            />
            <AvatarFallback className="rounded-full font-bold text-sidebar-accent-foreground">
              {data?.first_name?.[0]?.toUpperCase()}
              {data?.last_name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-56 rounded-lg"
        side={isMobile ? "bottom" : "bottom"}
        align="start"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-2 font-normal">
          <div className="grid text-center">
            <span className="font-semibold">
              {data?.first_name + " " + data?.last_name}
            </span>
            <span className="text-xs text-muted-foreground">{data?.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/settings">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              {t("profile")}
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer bg-sidebar-accent-foreground text-sidebar-foreground hover:bg-white hover:text-sidebar-accent-foreground"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
