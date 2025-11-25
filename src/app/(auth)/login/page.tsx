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
import { useAppDispatch } from "@/redux/hooks";
import { useLoginUserMutation } from "@/redux/reducers/auth-reducer";
import { loginSuccess } from "@/redux/reducers/auth-slice";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [locale, setLocale] = useState<string>(
    typeof window !== "undefined"
      ? localStorage.getItem("locale") || "en"
      : "en",
  );
  const t = useTranslations("auth.login");
  const loginSchema = z.object({
    email: z.string().email(t("invalidEmail")),
    password: z.string().min(8, t("passwordMin")),
  });

  type LoginFormValues = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const router = useRouter();
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const dispatch = useAppDispatch();

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const res = await loginUser(data);

      if ("data" in res) {
        const accessToken = res.data.access;
        const refreshToken = res.data.refresh;
        dispatch(loginSuccess({ accessToken, refreshToken }));
        router.push("/");
        toast.success(t("loginSuccess"));
      } else if ("error" in res) {
        const error = res.error as { data: { detail: string }; status: number };
        if (error.status === 401) {
          toast.error(t("invalidCredentials"));
        } else {
          toast.error(t("loginFailed"));
        }
      }
    } catch {
      toast.error(t("loginError"));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLocaleToggle = () => {
    const next = locale === "en" ? "de" : "en";
    setLocale(next);
    try {
      localStorage.setItem("locale", next);
      // also set cookie so server-side i18n picks this up
      document.cookie = `locale=${next}; path=/`;
    } catch (e) {
      console.error("Failed to set locale in localStorage or cookie", e);
    }
    toast.success(t("languageSet", { lang: next.toUpperCase() }));
    try {
      router.refresh();
    } catch (e) {
      console.error("Failed to refresh router", e);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#292929] px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center">
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

        <Card className="w-full">
          <CardHeader className="relative space-y-1">
            <CardTitle className="text-center text-2xl">{t("title")}</CardTitle>
            <CardDescription className="text-center">
              {t("description")}
            </CardDescription>
            <div className="absolute right-2 top-2">
              <Select value={locale} onValueChange={handleLocaleToggle}>
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
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  className="p-5"
                  placeholder={t("emailPlaceholder")}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">{t("password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="p-5"
                    placeholder={t("passwordPlaceholder")}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-sidebar-accent p-5 hover:bg-sidebar-accent/90"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : t("signIn")}
              </Button>
              <p className="text-center text-sm text-gray-600">
                {t("dontHaveAccount")}{" "}
                <Link
                  href="/register"
                  className="font-medium text-sidebar-accent hover:text-sidebar-accent/90"
                >
                  {t("signUpHere")}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
