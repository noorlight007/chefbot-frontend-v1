"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSetPasswordMutation } from "@/redux/reducers/auth-reducer";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Component that uses searchParams - must be wrapped in Suspense
function SetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [locale, setLocale] = useState<string>(
    typeof window !== "undefined"
      ? localStorage.getItem("locale") || "en"
      : "en",
  );
  const t = useTranslations("auth.setPassword");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordSchema),
  });

  const [setPassword, { isLoading }] = useSetPasswordMutation();
  const router = useRouter();

  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const onSubmit = async (data: SetPasswordFormValues) => {
    const res = await setPassword({
      sessionId: sessionId as string,
      data: data,
    });
    if (res.data) {
      toast.success(t("success"), { duration: 3000 });
      router.push("/login");
    }
  };

  const handleLocaleChange = (next: string) => {
    setLocale(next);
    try {
      localStorage.setItem("locale", next);
      document.cookie = `locale=${next}; path=/`;
    } catch (e) {
      console.error("Failed to set locale in localStorage or cookie", e);
    }
    toast.success(`Language set to ${next.toUpperCase()}`);
    try {
      router.refresh();
    } catch (e) {
      console.error("Failed to refresh the router", e);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#292929]">
      <div className="mb-8 flex flex-col items-center justify-center">
        <div className="rounded-xl bg-sidebar px-5 py-3">
          <Image
            src="/logo.png"
            alt="ChefBot Logo"
            width={70}
            height={70}
            className="h-16 w-auto"
          />
        </div>
      </div>
      <div className="flex items-center justify-center px-3">
        <Card className="w-[350px]">
          <CardHeader className="relative space-y-1">
            <CardTitle className="text-center text-2xl">{t("title")}</CardTitle>
            <CardDescription className="text-center">
              {t("description")}
            </CardDescription>
            <div className="absolute right-2 top-2">
              <Select value={locale} onValueChange={handleLocaleChange}>
                <SelectTrigger className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1 text-xs text-white focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">{t("password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("passwordPlaceholder")}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm_password">{t("confirmPassword")}</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t("confirmPasswordPlaceholder")}
                    {...register("confirm_password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="text-sm text-red-500">
                    {errors.confirm_password.message}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-sidebar-accent hover:bg-sidebar-accent"
              >
                {isLoading ? t("loading") : t("setPasswordButton")}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

// Loading fallback component
function SetPasswordLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mb-8 flex flex-col items-center justify-center">
        <div className="rounded-xl bg-sidebar px-5 py-3">
          <div className="h-16 w-16 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="mt-1 h-4 w-32 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="flex items-center justify-center bg-background">
        <Card className="w-[350px]">
          <CardHeader className="space-y-1">
            <div className="mx-auto h-8 w-32 animate-pulse rounded bg-gray-200" />
            <div className="mx-auto h-4 w-48 animate-pulse rounded bg-gray-200" />
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
              <div className="h-10 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="grid gap-2">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-10 animate-pulse rounded bg-gray-200" />
            </div>
          </CardContent>
          <CardFooter>
            <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function SetPasswordPage() {
  return (
    <Suspense fallback={<SetPasswordLoading />}>
      <SetPasswordForm />
    </Suspense>
  );
}

const setPasswordSchema = z
  .object({
    password: z
      .string()
      .min(
        8,
        "This password is too short. It must contain at least 8 characters.",
      )
      .regex(/^(?!^\d+$).*$/, "This password is entirely numeric.")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character",
      )
      .refine(
        (password) => {
          const commonPasswords = [
            "password",
            "12345678",
            "qwerty",
            "admin123",
          ];
          return !commonPasswords.includes(password.toLowerCase());
        },
        {
          message: "This password is too common. Please use a unique password.",
        },
      ),
    confirm_password: z
      .string()
      .min(
        8,
        "This password is too short. It must contain at least 8 characters.",
      ),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type SetPasswordFormValues = z.infer<typeof setPasswordSchema>;
