"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSidebar } from "@/components/ui/sidebar";
import { useAppDispatch } from "@/redux/hooks";
import {
  useGetLoggedUserQuery,
  useUpdateUserInfoMutation,
} from "@/redux/reducers/auth-reducer";
import { logout } from "@/redux/reducers/auth-slice";
import { LogOut, User } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";

export function NavUser() {
  const { isMobile } = useSidebar();
  const dispatch = useAppDispatch();
  const { data } = useGetLoggedUserQuery({});
  const t = useTranslations("profile.navUser");
  const [updateUserInfo] = useUpdateUserInfoMutation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("ENGLISH");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");

  // Sync selected language with user data
  useEffect(() => {
    if (data?.language) {
      setSelectedLanguage(data.language);
    }
    if (data?.currency) {
      setSelectedCurrency(data.currency);
    }
  }, [data?.language, data?.currency]);

  const handleLanguageChange = async (language: string) => {
    setSelectedLanguage(language);
    try {
      await updateUserInfo({
        language: language,
      }).unwrap();
      // Convert language to locale code (ENGLISH -> en, GERMAN -> de)
      const localeCode = language === "GERMAN" ? "de" : "en";
      // Set cookie before reload so middleware reads the correct locale
      document.cookie = `locale=${localeCode}; path=/; max-age=31536000`;
      // Force reload after successful language update
      window.location.reload();
    } catch (error) {
      console.error("Failed to update language:", error);
      // Revert to previous language on error
      setSelectedLanguage(data?.language || "ENGLISH");
    }
  };

  const handleCurrencyChange = async (currency: string) => {
    setSelectedCurrency(currency);
    try {
      await updateUserInfo({
        currency: currency,
      }).unwrap();
    } catch (error) {
      console.error("Failed to update currency:", error);
      setSelectedCurrency(data?.currency || "USD");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="flex items-center gap-3">
      <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
        <SelectTrigger className="w-[105px] border-primary bg-sidebar text-sidebar-foreground">
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="USD">USD ($)</SelectItem>
          <SelectItem value="EUR">EUR (€)</SelectItem>
          <SelectItem value="YEN">YEN (¥)</SelectItem>
          <SelectItem value="AED">AED (د.إ)</SelectItem>
        </SelectContent>
      </Select>

      <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[105px] border-primary bg-sidebar text-sidebar-foreground">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ENGLISH">English</SelectItem>
          <SelectItem value="GERMAN">Deutsch</SelectItem>
        </SelectContent>
      </Select>
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
              <span className="text-xs text-muted-foreground">
                {data?.email}
              </span>
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
    </div>
  );
}
