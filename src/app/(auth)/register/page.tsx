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
import { useRegisterUserMutation } from "@/redux/reducers/auth-reducer";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast } from "sonner";
import * as z from "zod";

const registerSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must not exceed 15 digits"),
  currency: z.string().min(1, "Preferred currency is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  avatar: z.string().nullable().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;
type RegisterError = {
  status: number;
  data?: { email?: string[]; phone?: string[] };
};

export default function RegisterPage() {
  const [locale, setLocale] = useState<string>(
    typeof window !== "undefined"
      ? localStorage.getItem("locale") || "en"
      : "en",
  );
  const t = useTranslations("auth.register");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarFileName, setAvatarFileName] = useState<string>("");

  const currencyValues = [
    { label: "USD - US Dollar", value: "USD" },
    { label: "EUR - Euro", value: "EUR" },
    { label: "YEN - Japanese Yen", value: "YEN" },
    { label: "AED - United Arab Emirates Dirham", value: "AED" },
  ];

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      gender: "MALE",
    },
  });

  const [registerUser, { isLoading }] = useRegisterUserMutation();
  const router = useRouter();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const formData = new FormData();
      formData.append("first_name", data.first_name);
      formData.append("last_name", data.last_name);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("currency", data.currency);
      formData.append("gender", data.gender);
      formData.append("date_of_birth", data.date_of_birth);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const res = await registerUser(formData);

      if ("data" in res) {
        toast.success(
          "Account has been created. Check your registered mail to set password and login",
        );
        router.push(`/set-password?sessionId=${res.data.uid}`);
      } else if ("error" in res) {
        const error = res.error as RegisterError;
        if (error.status === 400 && error.data?.email) {
          toast.error(error.data.email[0], {
            duration: 4000,
          });
        } else if (error.status === 400 && error.data?.phone) {
          toast.error(error.data.phone[0], {
            duration: 4000,
          });
        } else {
          toast.error("An unexpected error occurred. Please try again.", {
            duration: 4000,
          });
        }
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const handleLocaleToggle = () => {
    const next = locale === "en" ? "de" : "en";
    setLocale(next);
    try {
      localStorage.setItem("locale", next);
      // also set cookie so server-side i18n picks this up
      document.cookie = `locale=${next}; path=/`;
    } catch (e) {
      // ignore
    }
    toast.success(`Language set to ${next.toUpperCase()}`);
    // refresh the page so Next.js picks up new locale if using server-driven i18n
    try {
      router.refresh();
    } catch (e) {
      // ignore in case router.refresh is unavailable
    }
  };

  const handleLocaleChange = (next: string) => {
    setLocale(next);
    try {
      localStorage.setItem("locale", next);
      document.cookie = `locale=${next}; path=/`;
    } catch (e) {
      // ignore
    }
    toast.success(`Language set to ${next.toUpperCase()}`);
    try {
      router.refresh();
    } catch (e) {
      // ignore
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const fileName = file.name;
      setAvatarFileName(fileName);
      setValue("avatar", fileName);
    }
  };

  return (
    <div className="min-h-screen bg-[#242020] py-8">
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
      <div className="mx-auto max-w-md px-3">
        <Card className="relative shadow-lg">
          <CardHeader className="space-y-1 pb-8">
            <CardTitle className="text-center text-2xl font-semibold">
              {t("title")}
            </CardTitle>
            <CardDescription className="text-center text-gray-500">
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
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-sm font-medium">
                    {t("firstName")}*
                  </Label>
                  <Input
                    id="first_name"
                    placeholder={t("firstNamePlaceholder")}
                    className={`${errors.first_name ? "border-red-500 focus:border-red-500" : ""}`}
                    {...register("first_name")}
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.first_name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-sm font-medium">
                    {t("lastName")}*
                  </Label>
                  <Input
                    id="last_name"
                    placeholder={t("lastNamePlaceholder")}
                    className={`${errors.last_name ? "border-red-500 focus:border-red-500" : ""}`}
                    {...register("last_name")}
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  {t("email")}*
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  className={`${errors.email ? "border-red-500 focus:border-red-500" : ""}`}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  {t("phone")}*
                </Label>
                <Controller
                  name="phone"
                  control={control}
                  defaultValue=""
                  render={({ field: { onChange, value } }) => (
                    <PhoneInput
                      country={"de"}
                      value={value}
                      onChange={(phone) => onChange("+" + phone)}
                      enableSearch={true}
                      countryCodeEditable={false}
                      searchPlaceholder={t("countrySearch")}
                      containerClass={errors.phone ? "phone-input-error" : ""}
                      inputStyle={{
                        width: "100%",
                        height: "40px",
                        fontSize: "16px",
                        padding: "8px 45px",
                        borderRadius: "6px",
                        border: errors.phone
                          ? "1px solid #ef4444"
                          : "1px solid #e2e8f0",
                      }}
                      buttonStyle={{
                        borderRadius: "6px 0 0 6px",
                        border: errors.phone
                          ? "1px solid #ef4444"
                          : "1px solid #e2e8f0",
                      }}
                      searchStyle={{
                        width: "100%",
                        padding: "8px",
                        margin: "0",
                      }}
                    />
                  )}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.phone.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="currency" className="text-sm font-medium">
                  {t("preferredCurrency")}*
                </Label>
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <SelectTrigger
                        className={errors.currency ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder={t("selectCurrency")} />
                      </SelectTrigger>
                      <SelectContent>
                        {currencyValues.map((currency) => (
                          <SelectItem
                            key={currency.value}
                            value={currency.value}
                          >
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.currency && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.currency.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium">
                    {t("gender")}
                  </Label>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <SelectTrigger
                          className={errors.gender ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder={t("selectGender")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">
                            {t("genderOptions.male")}
                          </SelectItem>
                          <SelectItem value="FEMALE">
                            {t("genderOptions.female")}
                          </SelectItem>
                          <SelectItem value="OTHER">
                            {t("genderOptions.other")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.gender && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.gender.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="date_of_birth"
                    className="text-sm font-medium"
                  >
                    {t("dateOfBirth")}
                  </Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    className={`${errors.date_of_birth ? "border-red-500 focus:border-red-500" : ""}`}
                    {...register("date_of_birth")}
                  />
                  {errors.date_of_birth && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.date_of_birth.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar" className="text-sm font-medium">
                  {t("profilePicture")}
                </Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer file:mr-4 file:h-full file:rounded-md file:border-0 file:bg-sidebar-accent file:px-4 file:text-xs file:text-white file:transition-colors file:hover:bg-sidebar-accent/90"
                />
                {avatarFileName && (
                  <p className="mt-1 text-xs text-gray-500">
                    {t("selectedFile", { file: avatarFileName })}
                  </p>
                )}
                {errors.avatar && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.avatar.message}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-6">
              <Button
                type="submit"
                className="w-full bg-sidebar-accent transition-colors hover:bg-sidebar-accent/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {t("loading")}
                  </span>
                ) : (
                  t("createAccount")
                )}
              </Button>
              <p className="text-center text-sm text-gray-600">
                {t("alreadyHaveAccount")}{" "}
                <Link
                  href="/login"
                  className="font-medium text-sidebar-accent hover:underline"
                >
                  {t("signInHere")}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
