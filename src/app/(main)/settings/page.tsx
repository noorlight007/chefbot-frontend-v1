"use client";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { FC, useState } from "react";
import { useGetLoggedUserQuery } from "@/redux/reducers/auth-reducer";
import SettingsSkeleton from "@/components/pages/settings/skeletons/settings-skeleton";
import UpdateProfile from "@/components/pages/settings/modals/update-profile-card";
import ChangePasswordCard from "@/components/pages/settings/modals/change-password-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const SettingsPage: FC = () => {
  const t = useTranslations("settings");
  const router = useRouter();
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] =
    useState(false);
  const { data: userData, isLoading } = useGetLoggedUserQuery({});

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-start justify-between gap-4 lg:mb-8 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8 rounded-full bg-sidebar-accent/50 text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {t("title")}
          </h1>
        </div>
      </div>

      <div>
        <div className="mb-8 rounded-xl bg-white p-4 shadow-lg transition-all hover:shadow-xl sm:p-6 md:p-8">
          <div className="mb-6 flex items-start justify-between border-b pb-4 sm:mb-8 sm:pb-6">
            <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
              {t("profile.title")}
            </h2>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="mx-auto w-3/4 lg:w-1/4">
              <div className="relative mx-auto max-w-xs lg:max-w-full">
                <Image
                  src={userData.avatar ?? "/restaurant-demo.jpg"}
                  alt="Profile avatar"
                  width={200}
                  height={200}
                  className="aspect-square w-full rounded-2xl object-cover ring-4 ring-purple-400"
                />
              </div>
            </div>

            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:w-3/4">
              <div className="rounded-lg bg-gray-50 p-4 transition-all hover:bg-gray-100">
                <p className="mb-2 text-sm font-medium text-purple-600">
                  {t("profile.firstName")}
                </p>
                <p className="text-base font-semibold text-gray-800 sm:text-lg">
                  {userData?.first_name}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 transition-all hover:bg-gray-100">
                <p className="mb-2 text-sm font-medium text-purple-600">
                  {t("profile.lastName")}
                </p>
                <p className="text-base font-semibold text-gray-800 sm:text-lg">
                  {userData?.last_name}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 transition-all hover:bg-gray-100">
                <p className="mb-2 text-sm font-medium text-purple-600">
                  {t("profile.gender")}
                </p>
                <p className="text-base font-semibold text-gray-800 sm:text-lg">
                  {userData?.language === "GERMAN"
                    ? userData?.gender === "MALE"
                      ? "MÄNNLICH"
                      : userData?.gender === "FEMALE"
                      ? "WEIBLICH"
                      : userData?.gender
                    : userData?.gender}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 transition-all hover:bg-gray-100">
                <p className="mb-2 text-sm font-medium text-purple-600">
                  {t("profile.dateOfBirth")}
                </p>
                <p className="text-base font-semibold text-gray-800 sm:text-lg">
                  {userData?.date_of_birth}
                </p>
              </div>
              <div className="col-span-full rounded-lg bg-gray-50 p-4 transition-all hover:bg-gray-100">
                <p className="mb-2 text-sm font-medium text-purple-600">
                  {t("profile.orgLanguage")}
                </p>
                <p className="text-base font-semibold text-gray-800 sm:text-lg">
                  {userData?.language === "GERMAN" ? "DEUTSCH" : userData?.language}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end sm:mt-8">
            <Dialog
              open={isUpdateDialogOpen}
              onOpenChange={setIsUpdateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="rounded-lg bg-sidebar-accent px-4 py-2 text-sm text-white sm:px-6 sm:py-3 sm:text-base">
                  {t("profile.updateProfile")}
                </Button>
              </DialogTrigger>
              <DialogContent className="h-[90vh] w-[95vw] max-w-screen-lg bg-white sm:h-[90dvh]">
                <DialogTitle className="sr-only">
                  {t("profile.updateProfile")}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  {t("profile.updateProfileDescription")}
                </DialogDescription>
                <ScrollArea className="h-[80vh] w-full sm:h-[80dvh]">
                  <UpdateProfile
                    userInfo={userData}
                    onClose={() => setIsUpdateDialogOpen(false)}
                  />
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="my-6 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent sm:my-8" />

        <div className="mb-8 rounded-xl bg-white p-4 shadow-lg transition-all hover:shadow-xl sm:p-6 md:p-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
              {t("password.title")}
            </h2>
            <Dialog
              open={isChangePasswordDialogOpen}
              onOpenChange={setIsChangePasswordDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="w-full rounded-lg bg-sidebar-accent px-4 py-2 text-sm text-white sm:w-auto sm:px-6 sm:py-3 sm:text-base">
                  {t("password.changePassword")}
                </Button>
              </DialogTrigger>
              <DialogContent className="h-[80vh] w-[95vw] max-w-screen-md bg-white lg:h-[73dvh]">
                <DialogTitle className="sr-only">
                  {t("password.changePassword")}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  {t("password.changePasswordDescription")}
                </DialogDescription>
                <ScrollArea className="h-[70vh] w-full sm:h-[70dvh]">
                  <ChangePasswordCard
                    onClose={() => setIsChangePasswordDialogOpen(false)}
                  />
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
